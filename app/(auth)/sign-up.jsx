import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { ImageBackground, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { images, icons } from '../../constants';
import { createUser, getCurrentAccount } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { decryptPassword, encryptPassword, generateRandomKey } from '../../lib/crypto';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const SignUp = () => {
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })

  const { setUser, setIsLoggedIn, setAccount } = useGlobalContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the fields')
    }

    setIsSubmitting(true);

    try {
      const key = await generateRandomKey();
      const encryptedPassword = await encryptPassword(form.password, key)
      const result = await createUser(form.email, form.password, encryptedPassword, key, form.username)
      setUser(result);
      setIsLoggedIn(true);
      const acc = await getCurrentAccount();
      if (acc) {
        setAccount(acc);
      }
      router.replace('/home')
    }
    catch (error) {
      Alert.alert('Error', error);
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={images.forestSignUp}
        className="flex-1 w-full h-full"
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
      >
        {loading && (
          <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-25">
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}



        <View className="flex-1 justify-center items-center">
          <View
            className=" bg-gray-200 rounded-lg opacity-85"
            style={{ width: wp('80%'), paddingVertical: hp('2%'), paddingHorizontal: wp('3%') }}
          >
            <Text className="text-2xl font-bold mb-8 text-gray-800 text-center">
              Welcome to Greeny
            </Text>

            <TextInput
              className="border w-full rounded"
              style={{ padding: hp('1%'), height: hp('6%'), marginBottom: hp('1%') }}
              placeholder="Username"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              value={form.username}
              onChangeText={(e) => setForm({ ...form, username: e })}
            />

            <TextInput
              className="border w-full rounded"
              style={{ padding: hp('1%'), height: hp('6%'), marginBottom: hp('1%') }}
              placeholder="Email"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(e) => setForm({ ...form, email: e })}
            />

            <View
              className="border border-black w-full rounded flex-row items-center"
              style={{ marginBottom: hp('1%') }}
            >
              <TextInput
                className="rounded"
                style={{ padding: hp('1%'), height: hp('6%'), width: '88%' }}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(e) => setForm({ ...form, password: e })}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image
                  source={!showPassword ? icons.eye : icons.eyeHide}
                  className="w-6 h-6"
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-blue-500 w-full rounded"
              style={{ paddingVertical: hp('1.5%') }}
              onPress={() => submit()}
            >
              <Text className="text-center text-white text-lg font-semibold">
                Sign up
              </Text>
            </TouchableOpacity>
            <View
              className="flex-row justify-center"
              style={{ marginTop: hp('1%') }}
            >
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/login')}
              >
                <Text className="text-blue-500 font-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SignUp;
