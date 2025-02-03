import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image, Button, Pressable } from 'react-native';
import { Link, Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { PaperProvider } from 'react-native-paper'

import { useGlobalContext } from '../context/GlobalProvider';
import Container from '../components/Container';


export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();

  if (!isLoading && isLoggedIn) return <Redirect href="/home" />

  return (
    <PaperProvider>
      <Container
        colors={['#cccf9e', '#E7E8D1']}
      >
        <ScrollView contentContainerStyle={{ height: '100%' }}>
          <View className="w-full justify-center items-center h-full px-4">
            <Image
              source={images.logo}
              className="w-[416px] h-[130px]"
              resizeMode="contain"
            />
            <View className="mt-5" />
            <View className="items-center justify-center flex-row">
              <CustomButton
                title="Sign-up"
                handlePress={() => router.push('/sign-up')}
                useAnimatedIcon={false}
                imageSource={images.leaf}
                imageStyles={"mb-5"}
                textContainerStyles={'absolute'}
              />
              <View className="m-2"></View>
              <CustomButton
                title="Login"
                handlePress={() => router.push('/login')}
                imageSource={images.leafLogin}
                imageStyles={"mt-5"}
                textContainerStyles={'absolute'}
              />
            </View>
          </View>

        </ScrollView>

        <StatusBar
          style='dark' />
      </Container>
    </PaperProvider>
  );
}
