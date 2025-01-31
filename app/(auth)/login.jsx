import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { ImageBackground, SafeAreaView, ActivityIndicator, Alert } from 'react-native';

import { router } from 'expo-router';
import { images, icons } from '../../constants'
import { getCurrentUser, signIn } from '../../lib/appwrite';

import { useGlobalContext } from '../../context/GlobalProvider';

const LoginScreen = () => {
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const[form, setForm] = useState({
    email:'',
    password:''
  })

  const {setUser, setIsLoggedIn} = useGlobalContext();

  const submit = async () => {
    if(form.email==="" || form.password===""){
      Alert.alert('Error', 'Please fill in all the fields')
    }

    setIsSubmitting(true);

    try{
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);
      
      router.replace('/friends')
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
          <View className="w-4/5 bg-gray-200 rounded-lg p-6 opacity-85">
            <Text className="text-2xl font-bold mb-8 text-gray-800 text-center">
              Login
            </Text>

            <TextInput
              className="border border- w-full p-3 rounded mb-4"
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
                onChangeText={(e) => setForm({...form, password:e})}
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
              onPress={submit}
            >
              <Text className="text-center text-white text-lg font-semibold">
                Log In
              </Text>
            </TouchableOpacity>

            <View className="flex-row mt-4 justify-center">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity
                onPress={()=>router.push('/sign-up')}
              >
                <Text className="text-blue-500 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoginScreen;
