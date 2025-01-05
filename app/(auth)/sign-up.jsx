import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { ImageBackground, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { images, icons } from '../../constants';

import { createUser } from '../../lib/appwrite';

import { useGlobalContext } from '../../context/GlobalProvider';

const SignUp = () => {
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const[form, setForm] = useState({
    username:'',
    email:'',
    password:''
  })

  const { setUser, setIsLoggedIn } = useGlobalContext();

  const[isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if(!form.username || !form.email || !form.password){
      Alert.alert('Error', 'Please fill in all the fields')
    }

    setIsSubmitting(true);

    try{
      const result = await createUser(form.email, form.password, form.username)
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/home')
    }
    catch (error) {
      Alert.alert('Error', error.message)
    }
    finally{
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
          <View className="w-4/5 bg-gray-200 rounded-lg p-6 opacity-85">
            <Text className="text-2xl font-bold mb-8 text-gray-800 text-center">
              Welcome to Greeny
            </Text>

            <TextInput
              className="border border-black w-full p-3 rounded mb-4"
              placeholder="Username"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              value={form.username}
              onChangeText={(e) => setForm({...form, username: e})}
            />

            <TextInput
              className="border border-black w-full p-3 rounded mb-4"
              placeholder="Email"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(e) => setForm({...form, email: e})}
            />

            <View className="border border-black w-full p-3 rounded mb-6 flex-row items-center">
              <TextInput
                className="flex-1"
                placeholder="Password"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(e) => setForm({...form, password: e})}
              />

              <TouchableOpacity 
                onPress={()=>setShowPassword(!showPassword)}
              >
                <Image 
                  source={!showPassword ? icons.eye : icons.eyeHide} 
                  className="w-6 h-6"
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-blue-500 w-full py-3 rounded"
              onPress={()=>submit()}
            >
              <Text className="text-center text-white text-lg font-semibold">
                Sign up
              </Text>
            </TouchableOpacity>
            <View className="flex-row mt-4 justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity
                onPress={()=>router.push('/login')}
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
