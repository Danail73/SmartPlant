import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { ImageBackground, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { images, icons } from '../../constants'
import { getCurrentUser, signIn } from '../../lib/appwrite';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useGlobalContext } from '../../context/GlobalProvider';

const LoginScreen = () => {
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const { setUser, setIsLoggedIn } = useGlobalContext();

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert('Error', 'Please fill in all the fields')
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/home')
    }
    catch (error) {
      Alert.alert('Error', error.message)
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={images.forestLogin}
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
            className="bg-gray-200 rounded-lg opacity-85"
            style={{ width: wp('80%'), maxWidth: 550, paddingVertical: hp('2%'), paddingHorizontal: wp('3%') }}
          >
            <Text
              className="font-bold text-gray-800 text-center"
              style={{ marginBottom: hp('3%'), fontSize: hp('2.3%') }}
            >
              Login
            </Text>

            <TextInput
              className="border w-full rounded"
              style={{ padding: hp('1%'), height: hp('6%'), marginBottom: hp('1%'), fontSize: hp('1.7%') }}
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
                style={{ padding: hp('1%'), height: hp('6%'), width: '88%', fontSize: hp('1.7%') }}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(e) => setForm({ ...form, password: e })}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3"
              >
                <Image
                  source={!showPassword ? icons.eye : icons.eyeHide}
                  style={{ width: hp('2.4%'), height: hp('2.4%') }}
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-blue-500 w-full rounded"
              style={{ paddingVertical: hp('1.5%') }}
              onPress={submit}
            >
              <Text
                className="text-center text-white text-lg font-semibold"
                style={{ fontSize: hp('1.8%') }}
              >
                Log In
              </Text>
            </TouchableOpacity>

            <View
              className="flex-row justify-center"
              style={{ marginTop: hp('1%') }}
            >
              <Text
                className="text-gray-600"
                style={{ fontSize: hp('1.7%') }}
              >Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/sign-up')}
              >
                <Text
                  className="text-blue-500 font-semibold"
                  style={{ fontSize: hp('1.7%') }}
                >Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoginScreen;
