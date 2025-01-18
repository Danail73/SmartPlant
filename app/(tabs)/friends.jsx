import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Container from '../../components/Container';
import { PaperProvider, Searchbar } from 'react-native-paper';
import { getAllFriends, getAllOtherUsers, getCurrentUser, getUser } from '../../lib/appwrite';
import FriendComponent from '../../components/FriendComponent';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons } from '../../constants';
import SearchBar from '../../components/SearchBar';


const { width } = Dimensions.get('window');


const Friends = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const translateX = useSharedValue(width);
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useGlobalContext()
  const [upperSearchVisible, setUpperSearchVisible] = useState(false)
  const [bottomSearchVisible, setBottomSearchVisible] = useState(false)
  const [upperSearchQuery, setUpperSearchQuery] = useState('');
  const [bottomSearchQuery, setBottomSearchQuery] = useState('');
  let fr = [];

  const fetchFriends = async () => {
    try {
      if (user) {
        try {
          const request = await getAllFriends(user.$id)
          fr = request;
        } catch (error) {
          console.log('loser');
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
        const ids = new Set(fr.map((item) => item.$id))
        const other = response.filter((item) => !ids.has(item.$id))
        setUsers(other)
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

  const friendsSearchUpper = friends.filter((item) => item.username.toLowerCase().includes(upperSearchQuery.toLowerCase()));
  const friendsSearchBottom = users.filter((item) => item.username.toLowerCase().includes(bottomSearchQuery.toLowerCase()));

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
        <View className="items-center justify-center my-3">
          {!upperSearchVisible && (
            <View className="flex-row items-center justify-center">
              <View className="bg-notFullWhite h-[0.8px] w-[8%] mr-3"></View>
              <View className="flex-row justify-between w-[210px]">
                <Text className="text-white font-pregular text-lg">Your friend list</Text>
                <TouchableOpacity
                  onPress={() => setUpperSearchVisible(true)}
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
          <FlatList
            data={upperSearchVisible ? friendsSearchUpper : friends || []}
            keyExtractor={(item) => item.$id || item.id.toString()}
            renderItem={({ item }) => (
              <FriendComponent item={item} />
            )}
            className="my-2 h-[40%]"
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View className="items-center justify-center my-3">
          {!bottomSearchVisible && (
            <View className="flex-row items-center justify-center">
              <View className="bg-notFullWhite h-[0.8px] w-[8%] mr-3"></View>
              <View className="flex-row justify-between w-[210px]">
                <Text className="text-white font-pregular text-lg">Invite friends</Text>
                <TouchableOpacity
                  onPress={() => setBottomSearchVisible(true)}
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
          <FlatList
            data={bottomSearchQuery ? friendsSearchBottom : users || [] || []}
            keyExtractor={(item) => item.$id || item.id.toString()}
            renderItem={({ item }) => (
              <FriendComponent item={item} forInvite={true} fromUser={user} />
            )}
            className="my-2 h-[30%]"
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Container>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  searchbar: {
    width: '90%'
  },
});

export default Friends;