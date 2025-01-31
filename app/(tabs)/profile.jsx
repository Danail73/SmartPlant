import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Container from '../../components/Container'
import FormField from '../../components/FormField'
import { getCurrentAccount, getCurrentSession, currentAccountPassword } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import { decryptPassword } from '../../lib/crypto'
import { BlurView } from 'expo-blur'
import { icons } from '../../constants'
import CustomButton from '../../components/CustomButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Profile = () => {
  const [account, setAccount] = useState(null)
  const { user } = useGlobalContext()
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

  const getAccount = async () => {
    try {
      const account = await getCurrentAccount();
      setAccount(account)
    } catch (error) {
      console.log(error)
    }
  }

  const getDecryptedPassword = async () => {
    if (user)
      return await decryptPassword(user.password_key[0], user.password_key[1])
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

  useEffect(() => {
    if (user) {
      getDecryptedPassword()
        .then((pass) => {
          setPassword({ previous: pass, current: pass })
        })
      setEmail({ previous: user.email, current: user.email })
      setUsername({ previous: user.username, current: user.username })
      setProfilePic({ previous: user.avatar, current: user.avatar })
      getAccount()
    }
  }, [])

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      extraScrollHeight={100}
      enableOnAndroid={true}
      keyboardShouldPersistTaps='always'
    >
      <Container
        colors={['#4ec09c', '#a8d981']}
        statusBarStyle={'light'}
      >
        <View className="w-[120%] h-[50%] absolute top-[-28%] left-[-10%] shadow-md shadow-black" style={{ elevation: 5 }}>
          <View className="rounded-full w-full h-full items-center justify-end z-10 bg-[#3A5332]">
            <Text className="font-psemibold text-2xl text-[#f2f9f1] mb-2">{user.username}</Text>
            <View className="border-2 rounded-full w-[15%] h-[17%] bottom-[-5%] z-20 bg-[#3A5332]">
              <View className="w-full h-full">
                <TouchableOpacity
                  className="w-full h-full items-center justify-center"
                  onPress={() => {
                    setEditPic(!editPic)
                    if (!editPic) {
                      pickImage()
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
        <View className="items-center h-[37%] mt-[50%]">
          <View
            className="w-[90%] h-full items-center bg-notFullWhite rounded-xl shadow-sm shadow-inherit"
          >
            <FormField
              value={username.current}
              otherStyles={'rounded-lg w-[96%] px-5 mb-1 mt-3 justify-center min-h-[22.8%] max-h-[24%]'}
              inputStyles={'font-pregular w-[97%] border-gray-500'}
              handleChangeText={(e) => setUsername({ ...username, current: e })}
              useIcon={true}
              iconSource={icons.username}
              iconStyles={'w-8 h-8'}
            />
            <View className="h-[0.37%] max-h-[0.5%] bg-black w-[88%]"></View>
            <FormField
              value={email.current}
              otherStyles={'rounded-lg w-[96%] px-5 my-1 justify-center min-h-[22.8%] max-h-[24%]'}
              inputStyles={'font-pregular w-[97%] border-gray-500'}
              handleChangeText={(e) => setEmail({ ...email, current: e })}
              useIcon={true}
              iconSource={icons.email}
              iconStyles={'w-8 h-8'}
            />
            <View className="h-[0.28%] max-h-[0.5%] bg-black w-[88%]"></View>
            <FormField
              value={password.current}
              otherStyles={'rounded-lg w-[96%] px-5 mt-1 justify-center min-h-[22.8%] max-h-[24%]'}
              inputStyles={'font-pregular w-[97%] border-gray-500 mr-1'}
              handleChangeText={(e) => setPassword({ ...password, current: e })}
              useIcon={true}
              iconSource={icons.password}
              iconStyles={'w-8 h-8'}
              hideText={true}
            />
            <CustomButton
              containerStyles={'bg-blue-400 w-[25%] rounded-md h-[16%] right-[-20%]'}
              title='Save'
              textStyles={'text-white'}
            />
          </View>
        </View>
      </Container>
    </KeyboardAwareScrollView>
  )
}

export default Profile