import { StyleSheet, Text, View, Image, TouchableOpacity, KeyboardAvoidingView, Dimensions, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import Container from '../../components/Container'
import FormField from '../../components/FormField'
import { signOut, updateEmail, updatePassword, updateUser, updateUsername } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import { decryptPassword, encryptPassword } from '../../lib/crypto'
import { BlurView } from 'expo-blur'
import { icons } from '../../constants'
import CustomButton from '../../components/CustomButton'
import { useFriendsContext } from '../../context/FriendsProvider'
import { usePlantsContext } from '../../context/PlantsProvider'
import { router } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import LanguageMenu from '../../languageComponents/LanguageMenu'
import { t, useLanguage } from '../../translations/i18n'

const Profile = () => {
  const { friends } = useFriendsContext()
  const { plants } = usePlantsContext()
  const { user, setUser, setIsLoggedIn, switchLanguage, language } = useGlobalContext()
  const [email, setEmail] = useState({
    previous: '',
    current: ''
  })
  const [username, setUsername] = useState({
    previous: '',
    current: ''
  })
  const [password, setPassword] = useState({
    previous: '',
    current: ''
  })
  const [profilePic, setProfilePic] = useState({
    previous: '',
    current: ''
  })
  const [editPic, setEditPic] = useState(false)
  const [saveVisible, setSaveVisible] = useState(false)
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')


  const getDecryptedPassword = async () => {
    if (user) {
      const pass = await decryptPassword(user.password_key[0], user.password_key[1])
      return pass
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      setIsLoggedIn(false)

      router.replace('/login')
    } catch (error) { console.log(error) }
  }

  /*const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to choose a profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    console.log(result)

    if (!result.canceled) {
      setProfilePic({ ...profilePic, current: result.assets[0].uri });
    }
  };*/

  const cancel = () => {
    setUsername({ ...username, current: username.previous })
    setEmail({ ...email, current: email.previous })
    setPassword({ ...password, current: password.previous })
  }

  const handleUpdateUsername = async () => {
    try {
      const response = await updateUsername(username.current)
      return response
    } catch (error) {
      console.log(Error, error)
    }
  }

  const handleUpdateEmail = async () => {
    try {
      const response = await updateEmail(email.current, password.current)
      return response
    } catch (error) {
      console.log(Error, error)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      const response = await updatePassword(password.current, password.previous)
      return response
    } catch (error) {
      console.log(Error, error)
    }
  }

  const handleUpdateUser = async () => {
    try {
      const encryptedPassword = await encryptPassword(password.current, user.password_key[1])
      const form = { userId: user.$id, username: username.current, email: email.current, password: encryptedPassword, key: user.password_key[1] }
      const response = await updateUser(form)
      return response
    } catch (error) {
      console.log(error)
    }
  }

  const save = async () => {
    try {
      if (username.current != username.previous) {
        const response = await handleUpdateUsername()
      }
      if (email.current != email.previous) {
        const response = await handleUpdateEmail()
      }
      if (password.current != password.previous) {
        const response = await handleUpdatePassword()
      }
      const updatedUser = await handleUpdateUser();
      setUser(updatedUser)
    } catch (error) { }
  }

  useEffect(() => {
    if (user && user?.$id) {
      getDecryptedPassword()
        .then((pass) => {
          setPassword({ previous: pass, current: pass })
        })
      setEmail({ previous: user.email, current: user.email })
      setUsername({ previous: user.username, current: user.username })
      setProfilePic({ previous: user.avatar, current: user.avatar })
    }
  }, [user])

  useEffect(() => {
    if (user) {
      if (username.previous != username.current || email.previous != email.current || password.current != password.previous) {
        setSaveVisible(true)
      }
      else {
        setSaveVisible(false)
      }
    }
  }, [username, email, password])

  return (
    <Container
      colors={['#4ec09c', '#a8d981']}
      statusBarStyle={'light'}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="w-[120%] h-[50%] absolute top-[-29%] left-[-10%] shadow-md shadow-black z-10 overflow-visible" style={{ elevation: 5 }}>
          <View className="rounded-full w-full h-full items-center justify-end z-10 bg-[#3A5332]">
            <Text className="font-psemibold text-2xl text-[#f2f9f1] mb-2">{user.username}</Text>
            <View className="border-2 rounded-full w-[15%] h-[17%] bottom-[-5%] z-20 bg-[#3A5332]">
              <View className="w-full h-full">
                <TouchableOpacity
                  className="w-full h-full items-center justify-center"
                  onPress={() => {
                    setEditPic(!editPic)
                    if (!editPic) {
                      //pickImage()
                    }
                  }}
                >
                  <Image
                    source={profilePic.current ? { uri: profilePic.current } : ''}
                    className="w-full h-full rounded-full"
                  />
                  {editPic && (
                    <View className="w-full h-full rounded-full absolute overflow-hidden">
                      <BlurView
                        className="flex-1 items-center justify-center"
                        style={{ borderRadius: 35 }}
                        intensity={50}
                        tint='systemChromeMaterialDark'
                      >
                        <Image
                          source={icons.edit}
                          className="w-7 h-7"
                          style={{ tintColor: 'white' }}
                          resizeMode='contain'
                        />
                      </BlurView>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View className="bg-transparent w-[100%] h-[15%] mt-[20%] justify-end z-5">
          <LanguageMenu
            langContainerStyles={'absolute left-[10%] bottom-[5%]'}
            langMenuStyles={'bg-notFullWhite w-[18%] h-[12%] mt-[24%] ml-[6%] rounded-md items-center'}
          />
          <CustomButton
            containerStyles={'absolute right-[5%] items-center justify-center bg-notFullWhite rounded-md'}
            useAnimatedIcon={true}
            imageSource={icons.logoutAnim}
            iVisible={true}
            width={40}
            height={40}
            textContainerStyles={'items-center justify-center'}
            title={t('Logout')}
            textStyles={'font-pthin text-base'}
            opacityStyles={'flex-row px-2'}
            handlePress={logout}
          />
        </View>
        <View className="items-center justify-center flex-row gap-4 h-[6%]">
          <View className="flex-row gap-1 items-center">
            <Image
              source={icons.friendsFilled}
              className="w-8 h-8"
              style={{ tintColor: '#f2f9f1' }}
              resizeMode='contain'
            />
            <Text className="font-pmedium text-[#f2f9f1]">{friends.length}</Text>
          </View>
          <View className="flex-row gap-1 items-center justify-center">
            <Image
              source={icons.plantsFilled}
              className="w-8 h-8"
              style={{ tintColor: '#f2f9f1' }}
              resizeMode='contain'
            />
            <Text className="font-pmedium text-[#f2f9f1]">{plants.length}</Text>
          </View>

        </View>
        <View className="items-center mt-[10%] h-[40%]">
          <View className="w-[90%] h-full p-1 items-center z-20">
            <FormField
              value={username.current}
              otherStyles={'rounded-lg w-[96%] px-5 mb-1 mt-3 justify-center min-h-[24%] max-h-[24%]'}
              inputStyles={'font-pregular w-[97%] border-gray-500'}
              handleChangeText={(e) => setUsername({ ...username, current: e })}
              useIcon={true}
              iconSource={icons.username}
              iconStyles={'w-8 h-8'}
            />
            <View className="h-[0.1rem] bg-black w-[88%]"></View>
            <FormField
              value={email.current}
              otherStyles={'rounded-lg w-[96%] px-5 my-1 justify-center min-h-[24%] max-h-[24%]'}
              inputStyles={'font-pregular w-[97%] border-gray-500'}
              handleChangeText={(e) => setEmail({ ...email, current: e })}
              useIcon={true}
              iconSource={icons.email}
              iconStyles={'w-8 h-8'}
            />
            <View className="h-[0.1rem] bg-black w-[88%]"></View>
            <FormField
              value={password.current}
              otherStyles={'rounded-lg w-[96%] px-5 mt-1 justify-center min-h-[24%] max-h-[24%]'}
              inputStyles={'font-pregular w-[97%] border-gray-500 mr-1'}
              handleChangeText={(e) => setPassword({ ...password, current: e })}
              useIcon={true}
              iconSource={icons.password}
              iconStyles={'w-8 h-8'}
              hideText={true}
            />
            {saveVisible && (
              <View className="flex-1 flex-row gap-5 mt-1">
                <CustomButton
                  containerStyles={'bg-white border w-[36%] rounded-md min-h-[80%] max-h-[90%] '}
                  title='Cancel'
                  textStyles={'text-black font-pthin'}
                  textContainerStyles={'w-[70%] h-[100%] items-center justify-center border-l-2'}
                  imageContainerStyles={'w-[30%] h-[100%] bg-red-700 rounded-l items-center justify-center'}
                  useAnimatedIcon={true}
                  width={30}
                  height={30}
                  iVisible={true}
                  imageSource={icons.cancelAnim}
                  opacityStyles={'flex-row w-[100%] h-[100%]'}
                  handlePress={cancel}
                />
                <CustomButton
                  containerStyles={'bg-blue-500 w-[36%] rounded-md min-h-[80%] max-h-[90%] border'}
                  title='Save'
                  textStyles={'text-white font-pthin'}
                  textContainerStyles={' w-[70%] h-[100%] items-center justify-center border-l-2'}
                  imageContainerStyles={'w-[30%] h-[100%] bg-blue-700 rounded-l items-center justify-center'}
                  useAnimatedIcon={true}
                  width={30}
                  height={30}
                  iVisible={true}
                  imageSource={icons.saveAnim}
                  opacityStyles={'flex-row w-[100%] h-[100%]'}
                  handlePress={save}
                />
              </View>
            )}
          </View>
          <View
            className="w-[90%] bg-notFullWhite rounded-xl shadow-sm shadow-inherit absolute z-10"
            style={{ height: saveVisible ? '100%' : '90%' }}
          >

          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>

  )
}

export default Profile