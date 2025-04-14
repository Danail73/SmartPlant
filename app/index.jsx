import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image, Button, Pressable } from 'react-native';
import { Link, Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useGlobalContext } from '../context/GlobalProvider';
import Container from '../components/Container';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();



  if (!isLoading && isLoggedIn) return <Redirect href="/home" />

  return (
      <Container
        colors={['#cccf9e', '#E7E8D1']}
      >
        <ScrollView contentContainerStyle={{ height: '100%' }}>
          <View className="w-full justify-center items-center h-full px-4">
            <Image
              source={images.logo}
              //className="border"
              //className="w-[416px] h-[130px]"
              style={{ width: wp('70%'), height: hp('20%') }}
              resizeMode="contain"
            />
            <View style={{ marginTop: hp('2%') }} />
            <View className="items-center justify-center flex-row">
              <CustomButton
                title="Sign-up"
                bonusTextStyles={{ fontSize: hp('2%') }}
                handlePress={() => router.push('/sign-up')}
                useAnimatedIcon={false}
                imageSource={images.leaf}
                bonusImageStyles={{ width: wp('30%'), maxWidth: 200, height: hp('17%'), maxHeight: 200, marginBottom: hp('2%') }}
                //imageStyles={"border"}
                textContainerStyles={'absolute'}
              />
              <View className="m-2"></View>
              <CustomButton
                title="Login"
                bonusTextStyles={{ fontSize: hp('2%') }}
                handlePress={() => router.push('/login')}
                imageSource={images.leafLogin}
                useAnimatedIcon={false}
                bonusImageStyles={{ width: wp('30%'), maxWidth: 200, height: hp('17%'), maxHeight: 200, marginTop: hp('2%') }}
                //imageStyles={"border"}
                textContainerStyles={'absolute'}
              />
            </View>
          </View>

        </ScrollView>

        <StatusBar
          style='dark' />
      </Container>
  );
}
