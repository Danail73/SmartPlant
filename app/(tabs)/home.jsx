import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Alert } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import PlantBoardComponent from '../../components/PlantBoardComponent'
import { icons, images } from '../../constants'
import Container from '../../components/Container'
import { PaperProvider } from 'react-native-paper'
import { getAllPlants, createPlant, subscribeToPlants, updatePlantSensors, plantIdExists, updatePlantUsers } from '../../lib/appwrite'
import { Modal } from 'react-native-paper'
import FormField from '../../components/FormField'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalContext } from '../../context/GlobalProvider'
import { usePlantsContext } from '../../context/PlantsProvider'
import { t } from '../../translations/i18n'
import useMqttClient from '../../api/mqtt/mqtt'
import { useFriendsContext } from '../../context/FriendsProvider'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import ChooseFriendsMenu from '../../components/ChooseFriendsMenu'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';


const Home = () => {
  const { user, language } = useGlobalContext();
  const { client, temperature, waterLevel, status, humidity, brightness, isReceiving } = useMqttClient();
  const { friends } = useFriendsContext();
  const [activeItem, setActiveItem] = useState(null);
  const { plants, setPlants, setActivePlant, activePlant } = usePlantsContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [addVisible, setAddVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);
  const [form, setForm] = useState({
    plantId: '',
    name: '',
  });

  const clearForm = () => {
    setForm({ plantId: '', name: '' })
  }

  const handleCreatePlant = async () => {
    if (!form.plantId || !form.name) {
      Alert.alert("You must fill all forms")
    }
    else {
      const exists = await plantIdExists(form.plantId)
      if (exists) {
        try {
          await createPlant(form.plantId, form.name, [user.$id]);
        }
        catch (error) {
          console.log(error);
        }
        finally {
          clearForm();
        }
      }
      else {
        Alert.alert("Invalid plantId")
        clearForm();
      }
    }
  }

  const showModal = () => {
    setMenuVisible(true)
    translateY.value = withTiming(0, { duration: 300 })
    scale.value = withTiming(1, { duration: 300 })
    opacity.value = withTiming(1, { duration: 300 })
  };

  const hideModal = () => {
    translateY.value = withTiming(600, { duration: 300 })
    scale.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setMenuVisible)(false)
    })
    opacity.value = withTiming(0, { duration: 300 })
  };

  const viewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item);
      setActivePlant(viewableItems[0].item)
    }
  }, []);

  const viewConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const handlePlantUpdated = (response) => {
    const eventType = response.events;
    const updatedItem = response.payload
    if (eventType.some((item) => item.includes('delete'))) {
      setPlants((previous) => previous.filter((item) => item.$id != updatedItem.$id))
    }
    else if (eventType.some((item) => item.includes('create'))) {
      setPlants((previous) => [...previous, updatedItem])
    }
    else if (eventType.some((item) => item.includes('update'))) {
      setPlants((previous) => previous.map(
        (item) => item.$id == updatedItem.$id ? updatedItem : item
      ))
      if (activePlant && (activePlant.$id === updatedItem.$id)) {
        setActiveItem(updatedItem)
        setActivePlant(updatedItem)
      }
    }
  }

  const createMenuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  })

  useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => unsubscribePlants()
  }, [friends])

  const updateSensors = async () => {
    try {
      const sensorValues = [
        parseFloat(temperature),
        parseFloat(humidity),
        parseFloat(brightness),
        parseFloat(waterLevel),
        parseFloat(status.statusCode)
      ];
      const response = await updatePlantSensors(activeItem.$id, sensorValues);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (client) {
        updateSensors();
      }
    }, 300000)

    return () => clearInterval(interval)
  }, [activeItem])

  /*useEffect(() => {
    try {
      const response = fetchAIResponse("tomato")

    } catch (error) {
      console.log(error);
    }
  })*/


  return (
    <PaperProvider>
      <Container
        colors={['#4ec09c', '#a8d981']}
        statusBarStyle={'light'}
      >
        <View style={{ paddingHorizontal: wp('8%') }}>
          <View
            className={`items-center justify-between flex-row`}
            style={{ height: hp('7%'), paddingLeft: language == 'bg' ? 0 : wp('1%'), paddingTop: hp('2%') }}
          >
            <Text className={`text-notFullWhite font-pmedium`} style={{fontSize: language == 'bg' ? hp('2%') : hp('3%')}}>{t('Home')}</Text>
            <Text className="text-notFullWhite font-pmedium" style={{fontSize: hp('3%')}}>{temperature}</Text>
          </View>

          {plants && plants.length > 0 && (
            <View
              className="flex-row items-center"
              style={{ marginVertical: hp('2%') }}
            >
              <Image
                source={images.good}
                //className="border"
                style={{ width: wp('46%'), height: hp('23%') }}
                resizeMode='contain'
              />
              <View
                className="items-center justify-center"
                style={{ paddingLeft: wp('1%') }}
              >
                <Text className="font-pmedium text-notFullWhite" style={{fontSize: hp('2%')}}>{status.statusMessage}</Text>
              </View>
            </View>
          )}
          {!plants || plants.length == 0 && (
            <View
              className="flex-row items-center my-3"
              style={{ marginVertical: hp('2%') }}
            >
              <Image
                source={images.noResult}
                style={{ width: wp('46%'), height: hp('23%') }}
                resizeMode='contain'
              />
              <View
                className="items-center justify-center pl-2"
                style={{ paddingLeft: wp('1%') }}
              >
                <Text className="font-pmedium text-notFullWhite" style={{fontSize: hp('1%')}}>Looks like you{'\n'}don't have plants</Text>
              </View>
            </View>
          )}

          <View style={{ overflow: 'visible' }}>
            <View
              className="justify-between flex-row"
              style={{ paddingHorizontal: wp('2%') }}
            >
              <Text className="text-notFullWhite font-pmedium" style={{fontSize: hp('1.8%')}}>{t('Daily Plants')}</Text>
              <TouchableOpacity
                onPressOut={showModal}
              >
                <Image
                  source={icons.plus}
                  resizeMode='contain'
                  style={{ tintColor: 'white', width: hp('2.5%'), height: hp('2.5%') }}
                />
              </TouchableOpacity>
            </View>
            {(plants && plants.length > 0) ? (
              <View style={{ overflow: 'visible' }}>
                <FlatList
                  data={plants || []}
                  keyExtractor={(item) => item.$id}
                  renderItem={({ item }) => (
                    <PlantBoardComponent
                      item={item}
                      isReceiving={isReceiving}
                      addCallback={() => setAddVisible(true)}
                      removeCallback={() => setRemoveVisible(true)}
                    />
                  )}
                  style={{ overflow: 'visible'}}
                  contentContainerStyle={{ marginLeft: (plants && plants.length == 1) ? 40 : 0, overflow: 'visible' }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={viewableItemsChanged}
                  viewabilityConfig={viewConfig}
                  decelerationRate="fast"
                  pagingEnabled={true}
                  snapToAlignment='center'
                />
              </View>
            ) : (
              <View>
                <Text>{t('Looks like you still dont have any plants')}</Text>
              </View>
            )}
          </View>
        </View>
        {menuVisible && (
          <Animated.View
            className={`bg-notFullWhite items-center justify-center`}
            style={[
              styles.createMenu,
              {
                transform: [
                  { translateY: translateY },
                  { scale: scale }
                ]
              },
            ]}
          >
            <FormField
              title="plantId"
              placeholder={"Enter plantId"}
              bonusTextStyles={{paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.3%')}}
              containerStyles={{height: hp('11%')}}
              bonusInputStyles={{ height: hp('5%'), fontSize: hp('1.6%'), width: wp('56%'),paddingLeft: wp('2%') }}
              handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
            />
            <FormField
              title="name"
              placeholder={"Enter name"}
              bonusTextStyles={{paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.2%')}}
              containerStyles={{marginBottom: hp('1%'), height: hp('11%')}}
              bonusInputStyles={{ height: hp('5%'), fontSize: hp('1.6%'), width: wp('56%'), paddingLeft: wp('2%') }}
              handleChangeText={(e) => { setForm({ ...form, name: e }) }}
            />

            <View>
              <TouchableOpacity
                onPress={() => {
                  handleCreatePlant();
                  hideModal();
                }}
              >
                <LinearGradient
                  colors={['#fdb442', '#f69f2c']}
                  start={[0, 0]}
                  end={[1, 1]}

                  style={{
                    borderRadius: 35,
                    width: hp('6%'),
                    height: hp('6%'),
                    justifyContent:'center',
                    alignItems:'center'
                  }}
                  className="items-center justify-center"
                >
                  <Image
                    source={icons.plus}
                    resizeMode="contain"
                    className="rounded-full"
                    style={{ tintColor: '#f2f9f1', width: hp('3%'),height: hp('3%') }}
                  />

                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        {addVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <ChooseFriendsMenu
                friends={friends
                  .filter((item) => !activeItem.users.some((u) => u.$id === item.friend.$id))
                  .map((item) => item.friend)}
                cancel={() => {
                  setAddVisible(false)
                }}
                withRequest={false}
                currentUser={user}
                title={'Choose friends to add'}
                buttonTitle={'Add'}
                fn={async (list) => {
                  const newUsers = [...activeItem.users];
                  list.forEach((item) => {
                    newUsers.push(item)
                  })
                  const response = await updatePlantUsers(activeItem.$id, newUsers)
                }}
              />
            </BlurView>
          </SafeAreaView>
        )}

        {removeVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <ChooseFriendsMenu
                friends={activeItem.users.filter((item) => item.$id != user.$id)}
                cancel={() => {
                  setRemoveVisible(false)
                }}
                currentUser={user}
                withRequest={false}
                title={'Choose friends to remove'}
                buttonTitle={'Remove'}
                fn={async (list) => {
                  try {
                    let newUsers = activeItem.users.filter(
                      (u) => !list.some((item) => u.$id === item.$id)
                    );
                    const response = await updatePlantUsers(activeItem.$id, newUsers)
                  } catch (error) {
                    console.log(error)
                  }
                }}
              />
            </BlurView>
          </SafeAreaView>
        )}
      </Container>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  createMenu: {
    position: 'absolute',
    bottom: 100,
    right: wp('15%'),
    left: wp('15%'),
    height: hp('34%'),
    borderRadius: 20,
  }
});

export default Home;
