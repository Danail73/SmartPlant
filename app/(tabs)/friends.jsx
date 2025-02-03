import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, FlatList, TouchableOpacity, Image, TextInput, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import Container from '../../components/Container';
import { PaperProvider } from 'react-native-paper';
import { subscribeToFriendRequests, subscribeToUsers } from '../../lib/appwrite';
import FriendComponent from '../../components/FriendComponent';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons, images } from '../../constants';
import RequestMenu from '../../components/RequestMenu';
import { BlurView } from 'expo-blur';
import DeleteFriendsMenu from '../../components/DeleteFriendsMenu';
import AnimatedIcon from '../../components/AnimatedIcon';
import { useFriendsContext } from '../../context/FriendsProvider';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native';



const { width, height } = Dimensions.get('window');


const Friends = () => {
  const { user } = useGlobalContext()
  const { fetchData, friends, requestFriends, invitedFriends, others } = useFriendsContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuTranslateX = useSharedValue(width);
  const menuTranslateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const [upperSearchVisible, setUpperSearchVisible] = useState(false)
  const [bottomSearchVisible, setBottomSearchVisible] = useState(false)
  const [upperSearchQuery, setUpperSearchQuery] = useState('');
  const [bottomSearchQuery, setBottomSearchQuery] = useState('');
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);
  const [upperIconsVisible, setUpperIconsVisible] = useState(true)
  const [bottomIconsVisible, setBottomIconsVisible] = useState(true)

  const handleChangeTextUpper = (query) => setUpperSearchQuery(query)

  const handleClearUpper = () => {
    if (!upperSearchQuery) {
      setUpperSearchVisible(false)
      setUpperIconsVisible(true)
    }
    setUpperSearchQuery('')
  }

  const handleChangeTextBottom = (query) => setBottomSearchQuery(query)

  const handleClearBottom = () => {
    if (!bottomSearchQuery) {
      setBottomSearchVisible(false)
      setBottomIconsVisible(true)
    }
    setBottomSearchQuery('')
  }

  const friendsSearchUpper = () => {
    const result = friends.filter((item) => item.friend.username.toLowerCase().includes(upperSearchQuery.toLowerCase()))
    if (result.length == 0)
      return null
    return result

  }
  const friendsSearchBottom = () => {
    const result = others.filter((item) => item.username.toLowerCase().includes(bottomSearchQuery.toLowerCase()))
    if (result.length == 0 || !bottomSearchQuery)
      return null
    return result;
  };

  const openRequestMenu = () => {
    setMenuVisible(true);
    menuTranslateX.value = withTiming(0, { duration: 700 });
    menuTranslateY.value = withTiming(height * 5 / 12, { duration: 700 })
    rotation.value = withTiming(0, { duration: 700 })
  }

  const closeRequestMenu = () => {
    menuTranslateX.value = withTiming(width, { duration: 700 }, () => {
      runOnJS(setMenuVisible)(false)
    })
    menuTranslateY.value = withTiming(0, { duration: 700 })
    rotation.value = withTiming(180, { duration: 300 })
  }

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: menuTranslateX.value }],
    };
  });
  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: menuTranslateX.value }, { translateY: menuTranslateY.value }]
    }
  })

  const rotateAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  

  const handleUpdated = (request) => {
    fetchData()
  }

  useEffect(() => {
    const unsubscribeRequests = subscribeToFriendRequests(user.$id, handleUpdated)
    const unsubscribeUsers = subscribeToUsers(handleUpdated)

    return () => {
      unsubscribeRequests()
      unsubscribeUsers()
    }
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
            onPress={openRequestMenu}
          >
            <Image
              source={icons.menu1}
              className="w-8 h-8"
              style={{ tintColor: '#4d4752' }}
            />
            {requestFriends && requestFriends.length > 0 && (
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
                      setUpperIconsVisible(false)
                    }}
                  >
                    <AnimatedIcon
                      iconSource={icons.searchAnim}
                      isVisible={upperIconsVisible}
                      width={35}
                      height={35}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setDeleteMenuVisible(true)
                      setUpperIconsVisible(false)
                    }}
                  >
                    <AnimatedIcon
                      iconSource={icons.bin}
                      isVisible={upperIconsVisible}
                      width={33}
                      height={33}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="bg-notFullWhite h-[0.8px] w-[10%] ml-3"></View>
            </View>
          )}
          {upperSearchVisible && (
            <View className={`flex-row items-center bg-[#eee8f4] rounded-full h-[56px] w-[90%] px-4`}>
              <AnimatedIcon
                iconSource={icons.searchAnim}
                isVisible={upperSearchVisible}
                width={35}
                height={35}
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
              keyExtractor={(item) => item.friend.$id}
              renderItem={({ item }) => (
                <FriendComponent item={item.friend} otherStyles={'w-[330px]'} />
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
                    setBottomIconsVisible(false)
                  }}
                >
                  <AnimatedIcon
                    iconSource={icons.searchAnim}
                    isVisible={bottomIconsVisible}
                    width={35}
                    height={35}
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-notFullWhite h-[0.8px] w-[13%] ml-3"></View>
            </View>
          )}
          {bottomSearchVisible && (
            <View className={`flex-row items-center bg-[#eee8f4] rounded-full h-[56px] w-[90%] px-4`}>
              <AnimatedIcon
                iconSource={icons.searchAnim}
                isVisible={bottomSearchVisible}
                width={35}
                height={35}
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
                <FriendComponent item={item} forInvite={true} fromUser={user} otherStyles={'w-[330px]'} />
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
          <TouchableWithoutFeedback className="flex-1 w-full h-full absolute" onPress={closeRequestMenu}>
            <View className="flex-1 w-full h-full absolute ">
              <BlurView
                className="h-[104%]"
                intensity={40}
                tint='dark'
              >
                <Animated.View
                  style={[menuAnimatedStyle]}
                  className="w-[87%] h-[6%] top-[40%] right-0 absolute bg-notFullWhite items-start justify-center rounded-l-lg border "
                >
                  <TouchableOpacity
                    onPress={closeRequestMenu}
                    className="items-center ml-[4%]"
                  >
                    <Animated.Image
                      source={icons.rightArrow1}
                      className="w-9 h-9"
                      resizeMode="contain"
                      style={[rotateAnimatedStyle]}
                    />
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View
                  style={[menuAnimatedStyle, styles.requestMenu]}
                >
                  <RequestMenu requestFriends={requestFriends} invitedFriends={invitedFriends} />
                </Animated.View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        )}
        {deleteMenuVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <DeleteFriendsMenu friends={friends} cancel={() => {
                setDeleteMenuVisible(false)
                setUpperIconsVisible(true)
              }} currentUser={user} />
            </BlurView>
          </SafeAreaView>
        )}
      </Container>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  requestMenu: {
    position: 'absolute',
    right: 0,
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5
  }
})

export default Friends;