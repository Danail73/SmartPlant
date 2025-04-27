import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Image } from 'react-native';
import { Redirect, router } from 'expo-router';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useGlobalContext } from '../context/GlobalProvider';
import Container from '../components/Container';

export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();



  if (!isLoading && isLoggedIn) return <Redirect href="/home" />

  return (
      <Container
        colors={['#cccf9e', '#E7E8D1']}
      >
        <ScrollView contentContainerStyle={{ height: '100%' }}>
          <View className="w-full items-center h-full px-4" style={{position:'absolute', top: hp('25%')}}>
            {/* Green Care logo */}
            <Image
              source={images.logo}
              style={{ width: wp('75%'), height: hp('25%') }}
              resizeMode="contain"
            />
            <View style={{ marginTop: hp('2%') }} />
            <View className="items-center justify-center flex-row">
              {/* registration button */}
              <CustomButton
                title="Sign-up"
                bonusTextStyles={{ fontSize: hp('2%') }}
                handlePress={() => router.push('/sign-up')}
                useAnimatedIcon={false}
                imageSource={images.leaf}
                bonusImageStyles={{ width: wp('30%'), maxWidth: 200, height: hp('17%'), maxHeight: 200, marginBottom: hp('2%') }}
                textContainerStyles={'absolute'}
              />
              <View className="m-2"></View>
              {/* login button */}
              <CustomButton
                title="Login"
                bonusTextStyles={{ fontSize: hp('2%') }}
                handlePress={() => router.push('/login')}
                imageSource={images.leafLogin}
                useAnimatedIcon={false}
                bonusImageStyles={{ width: wp('30%'), maxWidth: 200, height: hp('17%'), maxHeight: 200, marginTop: hp('2%') }}
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
