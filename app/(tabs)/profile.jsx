import { Text, View, Image, TouchableOpacity, KeyboardAvoidingView, Dimensions } from 'react-native'
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
import LanguageMenu from '../../components/language/LanguageMenu'
import { t } from '../../translations/i18n'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
        <View
          className="absolute z-10 overflow-visible"
          style={{width: wp('120%'), height: hp('80%'), top: hp('-56%'),  left: wp('-10%')}}>
          <View className="rounded-full w-full h-full items-center justify-end z-10 bg-[#3A5332]">
            <Text className="font-psemibold text-[#f2f9f1] mb-2" style={{fontSize: hp('2.5%')}}>{user.username}</Text>
            <View className="border-2 rounded-full bottom-[-5%] z-20 bg-[#3A5332]" style={{width: hp('10%'), height: hp('10%')}}>
              <View className="w-full h-full">
                <View
                  className="w-full h-full items-center justify-center"
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
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="bg-transparent justify-end z-5" style={{width: wp('100%'), height: hp('15%'), marginTop: hp('13%')}}>
          <LanguageMenu
            langContainerStyles={'absolute left-[10%] bottom-[5%]'}
            langMenuStyles={'bg-notFullWhite rounded-md items-center'}
            bonusLandContainerStyles={{}}
            bonusLangMenuStyles={{width: wp('21.5%'), maxWidth: 120, height: hp('13.5%'), maxHeight: 145}}
          />
          <CustomButton
            containerStyles={'absolute right-[5%] items-center justify-center bg-notFullWhite rounded-md'}
            bonusContainerStyles={{width: hp('13%'), height: hp('5%')}}
            useAnimatedIcon={true}
            imageSource={icons.logoutAnim}
            imageContainerStyles={''}
            iVisible={true}
            width={40}
            height={40}
            textContainerStyles={'items-center justify-center'}
            title={t('Logout')}
            bonusTextStyles={{fontSize: hp('1.7%') < 17 ? hp('1.7%') : 17}}
            opacityStyles={'flex-row px-2'}
            handlePress={logout}
          />
        </View>
        <View className="items-center justify-center flex-row gap-4 h-[6%]">
          <View className="flex-row items-center" style={{gap: wp('1.4%')}}>
            <Image
              source={icons.friendsFilled}
              style={{ tintColor: '#f2f9f1', width: hp('3%'), height: hp('3%') }}
              resizeMode='contain'
            />
            <Text className="font-pmedium text-[#f2f9f1]" style={{fontSize: hp('1.6%')}}>{friends.length}</Text>
          </View>
          <View className="flex-row items-center justify-center" style={{gap: wp('0.6%')}}>
            <Image
              source={icons.plantsFilled}
              style={{ tintColor: '#f2f9f1', width: hp('3.2%'), height: hp('3.2%') }}
              resizeMode='contain'
            />
            <Text className="font-pmedium text-[#f2f9f1]" style={{fontSize: hp('1.6%')}}>{plants.length}</Text>
          </View>

        </View>
        <View className="items-center" style={{marginTop: hp('4%'), height: hp('40%'), width: wp('100%')}}>
          <View className="w-[90%] h-full p-1 items-center z-20">
            <FormField
              value={username.current}
              otherStyles={'rounded-lg w-[96%]  mb-1 mt-3 h-[20%]  items-center justify-center'}
              inputStyles={'font-pregular border-gray-500 w-[95%] max-w-[550] justify-center'}
              bonusInputStyles={{height: hp('6%'), marginBottom: hp('1%'), fontSize: hp('1.7%'), paddingLeft: '14%'}}
              handleChangeText={(e) => setUsername({ ...username, current: e })}
              useIcon={true}
              iconSource={icons.username}
              bonusIconStyles={{width: wp('8%'), height: wp('8%'), maxWidth: 43, maxHeight: 43}}
              iconContainerStyles={{marginBottom: '3%', position: 'absolute', bottom: '25%', left: '2%'}}
            />
            <View className="h-[0.1rem] bg-black w-[88%]"></View>
            <FormField
              value={email.current}
              otherStyles={'rounded-lg w-[96%]  mb-1 mt-3 h-[20%]  items-center justify-center'}
              inputStyles={'font-pregular border-gray-500 w-[95%] max-w-[550] justify-center'}
              bonusInputStyles={{height: hp('6%'), marginBottom: hp('1%'), fontSize: hp('1.7%'), paddingLeft: '14%'}}
              handleChangeText={(e) => setEmail({ ...email, current: e })}
              useIcon={true}
              iconSource={icons.email}
              bonusIconStyles={{width: wp('8%'), height: wp('8%'), maxWidth: 43, maxHeight: 43}}
              iconContainerStyles={{marginBottom: '3%', position: 'absolute', bottom: '25%', left: '2%'}}
            />
            <View className="h-[0.1rem] bg-black w-[88%]"></View>
            <FormField
              value={password.current}
              otherStyles={'rounded-lg w-[96%]  mb-1 mt-3 h-[20%]  items-center justify-center'}
              inputStyles={'font-pregular border-gray-500 w-[95%] max-w-[550] justify-center'}
              bonusInputStyles={{height: hp('6%'), marginBottom: hp('1%'), fontSize: hp('1.7%'), paddingHorizontal: '14%'}}
              handleChangeText={(e) => setPassword({ ...password, current: e })}
              useIcon={true}
              iconSource={icons.password}
              bonusIconStyles={{width: wp('8%'), height: wp('8%'), maxWidth: 43, maxHeight: 43}}
              iconContainerStyles={{marginBottom: '3%', position: 'absolute', bottom: '25%', left: '2%'}}
              hideText={true}
              hideTextIconStyles={{width: hp('3%'), height: hp('3%')}}
              hideTextStyles={{position: 'absolute', right:'2%', bottom:'35%'}}
            />
            {saveVisible && (
              <View className="flex-1 flex-row gap-5 mt-1">
                <CustomButton
                  containerStyles={'bg-white border w-[36%] max-w-[170] rounded-md h-[70%] max-h-[70]'}
                  title='Cancel'
                  textStyles={'text-black'}
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
                  containerStyles={'bg-blue-500 w-[36%] max-w-[170] rounded-md h-[70%] max-h-[70] border'}
                  title='Save'
                  textStyles={'text-white'}
                  textContainerStyles={'w-[70%] h-[100%] items-center justify-center border-l-2'}
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
            style={{ height: saveVisible ? '100%' : '85%' }}
          >

          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>

  )
}

export default Profile