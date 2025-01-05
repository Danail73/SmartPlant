import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image, Button, Pressable } from 'react-native';
import { Link, Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';

import { useGlobalContext } from '../context/GlobalProvider';


export default function App() {
  const {isLoading, isLoggedIn} = useGlobalContext();

  if(!isLoading && isLoggedIn) return <Redirect href="/home"/>

  return (
    <SafeAreaView className="bg-greeny h-full">
      <ScrollView contentContainerStyle={{height:'100%'}}>
        <View className="w-full justify-center items-center h-full px-4">
          <Image
            source={images.logo} 
            className="w-[416px] h-[130px]"
            resizeMode="contain"
          />
          <View className="mt-5"/>
          <View className="items-center justify-center flex-row">
            <CustomButton
              title="Sign-up"
              handlePress={() => router.push('/sign-up')}
              imageSource={images.leaf}
              imageStyles={"mb-5"}
            />
            <View className="m-2"></View>
            <CustomButton
              title="Login"
              handlePress={() => router.push('/login')}
              imageSource={images.leafLogin}
              imageStyles={"mt-5"}
            />
          </View>
        </View>
        
      </ScrollView>

      <StatusBar backgroundColor='#161622'
      style='light' />
    </SafeAreaView>
  );
}
