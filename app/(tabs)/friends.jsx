import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, FlatList, TouchableOpacity, Image, TextInput, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import Container from '../../components/Container';
import { PaperProvider } from 'react-native-paper';
import { deleteFriendRequest, respondFriendRequest, subscribeToFriendRequests, subscribeToUsers } from '../../lib/appwrite';
import FriendComponent from '../../components/friends/FriendComponent';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons, images } from '../../constants';
import RequestMenu from '../../components/friends/RequestMenu';
import { BlurView } from 'expo-blur';
import ChooseFriendsMenu from '../../components/friends/ChooseFriendsMenu';
import AnimatedIcon from '../../components/AnimatedIcon';
import { useFriendsContext } from '../../context/FriendsProvider';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { t } from '../../translations/i18n'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
  const [isLoading, setIsLoading] = useState(false)

  //function for changing text of the upper searchbar
  const handleChangeTextUpper = (query) => setUpperSearchQuery(query)

  //function to clear text from the upper searchbar
  const handleClearUpper = () => {
    if (!upperSearchQuery) {
      setUpperSearchVisible(false)
      setUpperIconsVisible(true)
    }
    setUpperSearchQuery('')
  }

  //function for changing text of the bottom searchbar
  const handleChangeTextBottom = (query) => setBottomSearchQuery(query)

  //function to clear text from the upper searchbar
  const handleClearBottom = () => {
    if (!bottomSearchQuery) {
      setBottomSearchVisible(false)
      setBottomIconsVisible(true)
    }
    setBottomSearchQuery('')
  }

  //function to get results from the upper searchbar
  const friendsSearchUpper = () => {
    const result = friends.filter((item) => item.friend?.username.toLowerCase().includes(upperSearchQuery.toLowerCase()))
    if (result.length == 0)
      return null
    return result

  }

  //function to get results from the bottom searchbar
  const friendsSearchBottom = () => {
    const result = others.filter((item) => item.username?.toLowerCase().includes(bottomSearchQuery.toLowerCase()))
    if (result.length == 0 || !bottomSearchQuery)
      return null
    return result;
  };

  //function to open the menu for managing friend requests
  const openRequestMenu = () => {
    setMenuVisible(true);
    menuTranslateX.value = withTiming(0, { duration: 700 });
    menuTranslateY.value = withTiming(height * 5 / 12, { duration: 700 })
    rotation.value = withTiming(0, { duration: 700 })
  }

  //function to close the menu for managing friend requests
  const closeRequestMenu = () => {
    menuTranslateX.value = withTiming(width, { duration: 700 }, () => {
      runOnJS(setMenuVisible)(false)
    })
    menuTranslateY.value = withTiming(0, { duration: 700 })
    rotation.value = withTiming(180, { duration: 300 })
  }

  //using useAnimatedStyle for the style of the request menu
  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: menuTranslateX.value }],
    };
  });

  //using useAnimatedStyle for the arrow for closing the request menu
  const rotateAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  //function called after receiving update of the users and friendRequests collections
  const handleUpdated = (request) => {
    fetchData()
  }

  //subscribing to the 
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
        {isLoading && (
          <BlurView
            className="w-full h-full items-center justify-center absolute z-50"
            intensity={70}
            tint='systemChromeMaterial'
          >
            <ActivityIndicator size={'large'} color={'green'} />
          </BlurView>
        )}
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: wp('8%'), marginTop: hp('1.5%') }}>
          <Text className="text-notFullWhite font-pmedium" style={{ fontSize: hp('3%') }}>{t('Friends')}</Text>
          <View>

            {/* button to open request menu */}
            <CustomButton
              useAnimatedIcon={true}
              imageSource={icons.menuAnimated}
              iVisible={true}
              width={hp('3.5%')}
              height={hp('3.5%')}
              textContainerStyles={'h-0 w-0'}
              handlePress={openRequestMenu}
            />

            {/* indicator to show if there is incoming friend request */}
            {requestFriends && requestFriends.length > 0 && (
              <View className="rounded-full border w-6 h-6 items-center justify-center bg-red-600 ml-1 absolute right-[-7] top-[-5]">
                <Text className="text-white text-xs">{requestFriends.length > 99 ? '99+' : requestFriends.length}</Text>
              </View>
            )}
          </View>
        </View>
        <View className="items-center justify-center" style={{ marginTop: hp('1.3%') }}>

          {/* if the searchbar is not open, showing text message and icons to open searchbar and deleteMenu */}
          {!upperSearchVisible && (
            <View className="flex-row items-center justify-center">
              <View className="bg-notFullWhite h-[0.1rem]" style={{ marginRight: wp('2.5%'), width: wp('8%') }}></View>
              <View className="flex-row justify-between" style={{ width: wp('58%') }}>
                <Text className="text-white font-pregular items-center justify-center" style={{ fontSize: hp('2%') }}>{t('Your friend list')}</Text>
                <View className="flex-row " style={{ gap: wp('2%'), marginRight: wp('2.5%') }}>
                  <TouchableOpacity
                    onPress={() => {
                      setUpperSearchVisible(true)
                      setBottomSearchVisible(false);
                      setBottomSearchQuery('')
                      setUpperIconsVisible(true)
                    }}
                  >
                    <AnimatedIcon
                      iconSource={icons.searchAnim}
                      isVisible={upperIconsVisible}
                      width={hp('4%')}
                      height={hp('4%')}
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
                      width={hp('4%')}
                      height={hp('4%')}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="bg-notFullWhite h-[0.1rem]" style={{ marginRight: wp('2.5%'), width: wp('8%') }}></View>
            </View>
          )}

          {/* showing searchbar when user opens it */}
          {upperSearchVisible && (
            <View className={`flex-row items-center bg-[#eee8f4] rounded-full`} style={{ paddingHorizontal: wp('2%'), width: wp('90%'), height: hp('7%'), maxHeight: 70 }}>
              <AnimatedIcon
                iconSource={icons.searchAnim}
                isVisible={upperIconsVisible}
                width={hp('4%')}
                height={hp('4%')}
              />
              <TextInput
                style={{ textAlignVertical: 'center', marginLeft: wp('3%'), fontSize: hp('1.7%') }}
                className={`w-[75%] font-pregular text-[#4d4752] justify-center items-center `}
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
                  resizeMode='contain'
                  style={{ tintColor: '#4d4752', width: hp('3%'), height: hp('3%') }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* when friendsSearchUpper function does not return null, showing list of friends*/}
          {friendsSearchUpper() ? (
            <FlatList
              data={friendsSearchUpper() || []}
              keyExtractor={(item) => item.friend.$id}
              renderItem={({ item }) => (
                <FriendComponent item={item.friend} containerStyles={{ width: wp('80%') }} />
              )}
              className="my-2"
              style={{ height: hp('30%') }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            //if friendsSearchUpper function returns null, showing noResult image
            <View className="items-center justify-center flex-col p-8 h-[300px]">
              <Image
                source={images.noResult}
                className="mb-3"
                resizeMode='contain'
                style={{ tintColor: '#4d4752', width: hp('13%'), height: hp('13%') }}
              />
              <Text className="text-[#4d4752] font-pregular text-lg">{t('No friends found')}</Text>
            </View>
          )}
        </View>

        {/* the same for the bottom searchbar, but here showing list of other users (not friends)*/}
        <View className="items-center justify-center my-3">
          {!bottomSearchVisible && (
            <View className="flex-row items-center justify-center">
              <View className="bg-notFullWhite h-[0.1rem]" style={{ marginRight: wp('2.5%'), width: wp('8%') }}></View>
              <View className="flex-row justify-between" style={{ width: wp('53%') }}>
                <Text className="text-white font-pregular " style={{ fontSize: hp('2%') }}>{t('Invite friends')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setBottomSearchVisible(true)
                    setUpperSearchVisible(false)
                    setUpperSearchQuery('')
                    setBottomIconsVisible(true)
                  }}
                >
                  <AnimatedIcon
                    iconSource={icons.searchAnim}
                    isVisible={bottomIconsVisible}
                    width={hp('4%')}
                    height={hp('4%')}
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-notFullWhite h-[0.1rem]" style={{ marginRight: wp('2.5%'), width: wp('13%') }}></View>
            </View>
          )}
          {bottomSearchVisible && (
            <View className={`flex-row items-center bg-[#eee8f4] rounded-full`} style={{ paddingHorizontal: wp('2%'), width: wp('90%'), height: hp('7%'), maxHeight: 70 }}>
              <AnimatedIcon
                iconSource={icons.searchAnim}
                isVisible={bottomSearchVisible}
                width={hp('4%')}
                height={hp('4%')}
              />
              <TextInput
                style={{ textAlignVertical: 'center', marginLeft: wp('3%'), fontSize: hp('1.7%') }}
                className={`w-[75%]  font-pregular text-[#4d4752] justify-center items-center `}
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
                  resizeMode='contain'
                  style={{ tintColor: '#4d4752', width: hp('3%'), height: hp('3%') }}
                />
              </TouchableOpacity>
            </View>
          )}
          {friendsSearchBottom() ? (
            <FlatList
              data={friendsSearchBottom() || []}
              keyExtractor={(item) => item.$id || item.id.toString()}
              renderItem={({ item }) => (
                <FriendComponent item={item} forInvite={true} fromUser={user} containerStyles={{ width: wp('80%') }} setIsLoading={setIsLoading} />
              )}
              className="my-2"
              style={{ height: hp('30%') }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center flex-col p-8 h-[300px]">
              <Image
                source={images.findFriends}
                className="mb-3"
                resizeMode='contain'
                style={{ tintColor: '#4d4752', width: hp('13%'), height: hp('13%') }}
              />
              <Text className="text-[#4d4752] font-pregular" style={{ fontSize: hp('2%') }}>{t('Search for friends')}</Text>
            </View>
          )}
        </View>

        {/* showing request menu when user opens it */}
        {menuVisible && (
          <TouchableWithoutFeedback className="flex-1 w-full h-full absolute" onPress={closeRequestMenu}>
            <View className="flex-1 w-full h-full absolute ">
              <BlurView
                className="h-[104%]"
                style={{ height: hp('110%') }}
                intensity={40}
                tint='dark'
              >
                <Animated.View
                  style={[menuAnimatedStyle, { width: wp('87%'), maxWidth: 670, height: hp('7%'), top: hp('45%') }]}
                  className="right-0 absolute bg-notFullWhite items-start justify-center rounded-l-lg border "
                >
                  {/* close option for the menu */}
                  <TouchableOpacity
                    onPress={closeRequestMenu}
                    className="items-center ml-[4%]"
                    style={{ marginLeft: wp('3%') }}
                  >
                    <Animated.Image
                      source={icons.rightArrow1}
                      resizeMode="contain"
                      style={[rotateAnimatedStyle, { width: hp('4%'), height: hp('4%') }]}
                    />
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View
                  style={[menuAnimatedStyle, styles.requestMenu]}
                >
                  <RequestMenu requestFriends={requestFriends} invitedFriends={invitedFriends} setIsLoading={setIsLoading} />
                </Animated.View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* showing delete menu when user opens it */}
        {deleteMenuVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <ChooseFriendsMenu
                friends={friends}
                cancel={() => {
                  setDeleteMenuVisible(false)
                  setUpperIconsVisible(true)
                }}
                withRequest={true}
                currentUser={user}
                title={'Choose friends to remove'}
                buttonTitle={'Remove'}
                fn={(list) => {
                  try {
                    setIsLoading(true)
                    list.forEach(async (item) => {
                      try {
                        const response = await deleteFriendRequest(item.request.$id)
                      } catch (error) {
                        console.log(error)
                      }
                    })
                  } catch (error) {
                    console.log(error)
                  }
                  finally { setIsLoading(false) }
                }}
              />
            </BlurView>
          </SafeAreaView>
        )}
      </Container>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  //style for the request menu
  requestMenu: {
    position: 'absolute',
    right: 0,
    width: '100%',
    height: '100%',
  }
})

export default Friends;