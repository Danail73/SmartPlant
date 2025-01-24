import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, FlatList, TouchableOpacity, Image, TextInput, Pressable, SafeAreaView } from 'react-native';
import Container from '../../components/Container';
import { PaperProvider } from 'react-native-paper';
import { getAllFriends, getAllOtherUsers, getCurrentUser, getUser } from '../../lib/appwrite';
import FriendComponent from '../../components/FriendComponent';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons, images } from '../../constants';
import RequestMenu from '../../components/RequestMenu';
import { BlurView } from 'expo-blur';
import { getFriendRequests, getSentRequests } from '../../lib/appwrite';
import DeleteFriendsMenu from '../../components/DeleteFriendsMenu';
import { use } from 'react';


const { width } = Dimensions.get('window');


const Friends = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const { user, isLoggedIn } = useGlobalContext()
  const [upperSearchVisible, setUpperSearchVisible] = useState(false)
  const [bottomSearchVisible, setBottomSearchVisible] = useState(false)
  const [upperSearchQuery, setUpperSearchQuery] = useState('');
  const [bottomSearchQuery, setBottomSearchQuery] = useState('');
  const [requestFriends, setRequestFriends] = useState([]);
  const [invitedFriends, setInvitedFriends] = useState([]);
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  let fr = [];

  const fetchFriends = async () => {
    try {
      if (user) {
        try {
          const request = await getAllFriends(user.$id)
          fr = request;
        } catch (error) {
        }
      }
      else {
        //not logged in
      }
    } catch (error) { }
  }

  const getAllOther = async () => {
    try {
      if (user) {
        const response = await getAllOtherUsers(user.$id)
        setUsers(response)
      }
    } catch (error) { }
  }

  const handleChangeTextUpper = (query) => setUpperSearchQuery(query)

  const handleClearUpper = () => {
    if (!upperSearchQuery)
      setUpperSearchVisible(false)
    setUpperSearchQuery('')
  }

  const handleChangeTextBottom = (query) => setBottomSearchQuery(query)

  const handleClearBottom = () => {
    if (!bottomSearchQuery)
      setBottomSearchVisible(false)
    setBottomSearchQuery('')
  }

  const friendsSearchUpper = () => {
    const result = friends.filter((item) => item.username.toLowerCase().includes(upperSearchQuery.toLowerCase()))
    if (result.length == 0)
      return null
    return result
  }
  const friendsSearchBottom = () => {
    const result = users.filter((item) => item.username.toLowerCase().includes(bottomSearchQuery.toLowerCase()))
    if (result.length == 0 || !bottomSearchQuery)
      return null
    return result;
  };

  const fetchRequestsAndFriends = async () => {
    try {
      const requests = await getFriendRequests(user.$id);
      const userPromises = requests.map(async (item) => {
        const friend = await getUser(item.fromUser);
        return { friend, requestId: item.$id };
      });
      const users = await Promise.all(userPromises);
      setRequestFriends(users);
    } catch (error) {
      //console.log('Error fetching friend requests: ', error);
    }
  };

  const fetchInvitedFriends = async () => {
    try {
      const requests = await getSentRequests(user.$id);
      const userPromises = requests.map(async (item) => {
        const friend = await getUser(item.toUser);
        return { friend, requestId: item.$id };
      });
      const users = await Promise.all(userPromises);
      setInvitedFriends(users);
    } catch (error) {
      //console.log('Error fetching invited friends: ', error)
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isLoggedIn) {
        await fetchRequestsAndFriends();
        await fetchInvitedFriends();
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [requestFriends]);

  useEffect(() => {

    const interval = setInterval(async () => {
      await fetchFriends();
      setFriends(fr)
      await getAllOther();
    }, 1000)

    return () => clearInterval(interval);
  }, [])

  return (
    <PaperProvider>
      <Container
        colors={['#4ec09c', '#a8d981']}
        statusBarStyle={'light'}
      >
        <View className="px-10 mt-3 flex-row items-center justify-between">
          <Text className="text-notFullWhite font-pmedium text-3xl">Friends</Text>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
          >
            <Image
              source={icons.menu1}
              className="w-8 h-8"
              style={{ tintColor: '#4d4752' }}
            />
            {requestFriends.length > 0 && (
              <View className="rounded-full border w-6 h-6 items-center justify-center bg-red-600 ml-1 absolute right-[-7] top-[-5]">
                <Text className="text-white text-xs">{requestFriends.length > 99 ? '99+' : requestFriends.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="items-center justify-center my-3">
          {!upperSearchVisible && (
            <View className="flex-row items-center justify-center">
              <View className="bg-notFullWhite h-[0.8px] w-[8%] mr-3"></View>
              <View className="flex-row justify-between w-[58%]">
                <Text className="text-white font-pregular text-lg">Your friend list</Text>
                <View className="flex-row gap-5">
                  <TouchableOpacity
                    onPress={() => {
                      setUpperSearchVisible(true)
                      setBottomSearchVisible(false);
                      setBottomSearchQuery('')
                    }}
                  >
                    <Image
                      source={icons.search}
                      className="w-8 h-8"
                      resizeMode='contain'
                      style={{ tintColor: '#f2f9f1' }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDeleteMenuVisible(true)}
                  >
                    <Image
                      source={icons.del}
                      className="w-8 h-8"
                      resizeMode='contain'
                      style={{ tintColor: '#f2f9f1' }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="bg-notFullWhite h-[0.8px] w-[10%] ml-3"></View>
            </View>
          )}
          {upperSearchVisible && (
            <View className={`flex-row items-center bg-[#eee8f4] rounded-full h-[56px] w-[90%] px-4`}>
              <Image
                source={icons.search}
                className="w-7 h-7"
                resizeMode='contain'
                style={{ tintColor: '#4d4752' }}
              />
              <TextInput
                style={{ textAlignVertical: 'center' }}
                className={`w-[75%] mx-4 text-lg font-pregular text-[#4d4752] justify-center items-center `}
                placeholder='Search for friends'
                value={upperSearchQuery}
                onChangeText={handleChangeTextUpper}
              />
              <TouchableOpacity
                onPress={handleClearUpper}
                className="absolute right-4"
              >
                <Image
                  source={icons.close}
                  className="w-7 h-7"
                  resizeMode='contain'
                  style={{ tintColor: '#4d4752' }}
                />
              </TouchableOpacity>
            </View>
          )}
          {friendsSearchUpper() ? (
            <FlatList
              data={friendsSearchUpper() || []}
              keyExtractor={(item) => item.$id || item.id.toString()}
              renderItem={({ item }) => (
                <FriendComponent item={item} otherStyles={'w-[330px]'}/>
              )}
              className="my-2 h-[300px]"
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center flex-col p-8 h-[300px]">
              <Image
                source={images.noResult}
                className="w-[100px] h-[100px] mb-3"
                resizeMode='contain'
                style={{ tintColor: '#4d4752' }}
              />
              <Text className="text-[#4d4752] font-pregular text-lg">No friends found</Text>
            </View>
          )}
        </View>

        <View className="items-center justify-center my-3">
          {!bottomSearchVisible && (
            <View className="flex-row items-center justify-center">
              <View className="bg-notFullWhite h-[0.8px] w-[8%] mr-3"></View>
              <View className="flex-row justify-between w-[210px]">
                <Text className="text-white font-pregular text-lg">Invite friends</Text>
                <TouchableOpacity
                  onPress={() => {
                    setBottomSearchVisible(true)
                    setUpperSearchVisible(false)
                    setUpperSearchQuery('')
                  }}
                >
                  <Image
                    source={icons.search}
                    className="w-8 h-8"
                    resizeMode='contain'
                    style={{ tintColor: '#f2f9f1' }}
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-notFullWhite h-[0.8px] w-[13%] ml-3"></View>
            </View>
          )}
          {bottomSearchVisible && (
            <View className={`flex-row items-center bg-[#eee8f4] rounded-full h-[56px] w-[90%] px-4`}>
              <Image
                source={icons.search}
                className="w-7 h-7"
                resizeMode='contain'
                style={{ tintColor: '#4d4752' }}
              />
              <TextInput
                style={{ textAlignVertical: 'center' }}
                className={`w-[75%] mx-4 text-lg font-pregular text-[#4d4752] justify-center items-center `}
                placeholder='Search for friends'
                value={bottomSearchQuery}
                onChangeText={handleChangeTextBottom}
              />
              <TouchableOpacity
                onPress={handleClearBottom}
                className="absolute right-4"
              >
                <Image
                  source={icons.close}
                  className="w-7 h-7"
                  resizeMode='contain'
                  style={{ tintColor: '#4d4752' }}
                />
              </TouchableOpacity>
            </View>
          )}
          {friendsSearchBottom() ? (
            <FlatList
              data={friendsSearchBottom() || []}
              keyExtractor={(item) => item.$id || item.id.toString()}
              renderItem={({ item }) => (
                <FriendComponent item={item} forInvite={true} fromUser={user} otherStyles={'w-[330px]'}/>
              )}
              className="my-2 h-[30%]"
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center flex-col mt-2 p-8 h-[250px]">
              <Image
                source={images.findFriends}
                className="w-[100px] h-[100px] mb-3"
                resizeMode='contain'
                style={{ tintColor: '#4d4752' }}
              />
              <Text className="text-[#4d4752] font-pregular text-lg">Search for friends</Text>
            </View>
          )}
        </View>
        {menuVisible && (
          <View className="flex-1 w-full h-full absolute ">
            <BlurView
              className="h-[104%]"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <RequestMenu
                onPress={() => { setMenuVisible(false) }}
                requestFriends={requestFriends}
                invitedFriends={invitedFriends}
              />
            </BlurView>
          </View>
        )}
        {deleteMenuVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <DeleteFriendsMenu friends={friends} cancel={() => setDeleteMenuVisible(false)} currentUser={user}/>
            </BlurView>
          </SafeAreaView>
        )}
      </Container>
    </PaperProvider>
  );
};

export default Friends;