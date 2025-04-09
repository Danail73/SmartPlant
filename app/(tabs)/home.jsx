import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, TouchableWithoutFeedback, Alert, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useState, useRef, act } from 'react'
import PlantBoardComponent from '../../components/plants/PlantBoardComponent'
import { icons, images } from '../../constants'
import Container from '../../components/Container'
import { PaperProvider } from 'react-native-paper'
import { createPlant, subscribeToPlants, updatePlantSensors, plantIdExists, updatePlantUsers } from '../../lib/appwrite'
import FormField from '../../components/FormField'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalContext } from '../../context/GlobalProvider'
import { usePlantsContext } from '../../context/PlantsProvider'
import { t } from '../../translations/i18n'
import { useFriendsContext } from '../../context/FriendsProvider'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import ChooseFriendsMenu from '../../components/friends/ChooseFriendsMenu'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Chart from '../../components/charts/Chart'
import { useMqttContext } from '../../context/MqttProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'


const Home = () => {
  const { user, language } = useGlobalContext();
  const { temperature, waterLevel, status, humidity, brightness, isReceiving, client } = useMqttContext();
  const { friends } = useFriendsContext();
  const [activeItem, setActiveItem] = useState(null);
  const { plants, setPlants, setActivePlant, activePlant, setActiveId, activeId } = usePlantsContext();
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

  const [data, setData] = useState({
    time: activePlant ? activePlant.time : [],
    temperature: activePlant ? activePlant.temperature : [],
    humidity: activePlant ? activePlant.humidity : [],
    brightness: activePlant ? activePlant.brightness : [],
    water: activePlant ? activePlant.water : [],
  })

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height - 30);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
    scale.value = withTiming(1, { duration: 200 })
    opacity.value = withTiming(1, { duration: 200 })
  };

  const hideModal = () => {
    scale.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setMenuVisible)(false)
    })
    opacity.value = withTiming(0, { duration: 200 })
  };

  const viewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item);
      setActivePlant(viewableItems[0].item)
      setActiveId(viewableItems[0].item.$id);
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
        setActiveId(updatedItem.$id)

      }
    }
  }

  const createMenuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  })



  const getStorageItem = async (key) => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      activePlant.$id
      console.log(error)
    }
  }

  useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => unsubscribePlants()
  }, [friends])

  const getCurrentTime = () => {
    const now = new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).replace(/\//g, "-").replace(", ", " ");
    return now;
  }

  const updateSensors = async (temp, hum, bri, wat, stat) => {
    try {
      const sensorValues = {
        time: getCurrentTime(),
        temperature: parseFloat(temp),
        humidity: parseFloat(hum),
        brightness: parseFloat(bri),
        water: parseFloat(wat),
        statusCode: parseFloat(stat)
      };
      const response = await updatePlantSensors(activePlant, sensorValues);
      return response;
    } catch (error) {
      console.log(error)
    }
  }
  const update = async () => {
    try {
      const temp = await getStorageItem("temperature");
      const hum = await getStorageItem("humidity");
      const bri = await getStorageItem("brightness");
      const wat = await getStorageItem("water");
      const stat = await getStorageItem("statusCode");

      if (temp != 0 && hum != 0 && bri != 0 && wat != 0) {
        const res = await updateSensors(temp, hum, bri, wat, stat);
      }
      return { temp, hum, bri, wat }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    const interval = setInterval(() => {
      update()
    }, 300000)

    return () => clearInterval(interval)
  }, [activeItem])

  useEffect(() => {
    if (activePlant) {
      setData({
        time: activePlant.time,
        temperature: activePlant.temperature,
        humidity: activePlant.humidity,
        brightness: activePlant.brightness,
        water: activePlant.water,
      })
    }
  }, [activePlant])


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
            <Text className={`text-notFullWhite font-pmedium`} style={{ fontSize: language == 'bg' ? hp('2%') : hp('3%') }}>{t('Home')}</Text>
            <Text className="text-notFullWhite font-pmedium" style={{ fontSize: hp('3%') }}>{temperature}°C</Text>
          </View>

          {plants && plants.length > 0 && (
            <View
              className="flex-row items-center"
              style={{ marginVertical: hp('2%') }}
            >
              <Image
                source={images.good}
                //className="border"
                style={{ width: wp('46%'), height: hp('23%'), maxWidth: 260, height: 200 }}
                resizeMode='contain'
              />
              <View
                className="items-center justify-center"
                style={{ paddingLeft: wp('1%') }}
              >
                <Text className="font-pmedium text-notFullWhite" style={{ fontSize: hp('2%') }}>{status.message}</Text>
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
                <Text className="font-pmedium text-notFullWhite" style={{ fontSize: hp('1%') }}>Looks like you{'\n'}don't have plants</Text>
              </View>
            </View>
          )}

          <View style={{ overflow: 'visible' }}>
            <View
              className="justify-between flex-row"
              style={{ paddingHorizontal: wp('2%') }}
            >
              <Text className="text-notFullWhite font-pmedium" style={{ fontSize: hp('1.8%') }}>{t('Daily Plants')}</Text>
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
                      isActive={activeItem && activeItem.$id == item.$id}
                      addCallback={() => setAddVisible(true)}
                      removeCallback={() => setRemoveVisible(true)}
                    />
                  )}
                  style={{ overflow: 'visible' }}
                  contentContainerStyle={{ marginLeft: (plants && plants.length == 1) ? wp('14%') : 0, overflow: 'visible' }}
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
          <Chart data={data} width={wp('100%')} height={hp('33%')} containerStyles={{ marginTop: hp('2%') }} />
        </View>
        {menuVisible && (
          <TouchableWithoutFeedback onPress={hideModal}>
            <View style={{ width: wp('100%'), height: hp('100%'), position: 'absolute', top: 0, left: 0, zIndex: 35 }}>
              <BlurView
                className="items-center justify-center"
                style={{width: wp('100%'), height: hp('100%'),...StyleSheet.absoluteFillObject}}
                intensity={40}
                tint='dark'
              >
                <Animated.View
                  className={`bg-notFullWhite items-center justify-center`}
                  style={[
                    styles.createMenu, createMenuAnimatedStyle, { bottom: hp('1%') < 10 ? hp('1%') + keyboardHeight : 130 + keyboardHeight }
                  ]}
                >
                  <FormField
                    title="plantId"
                    placeholder={"Enter plantId"}
                    bonusTextStyles={{ paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.3%') }}
                    containerStyles={{ height: hp('11%') }}
                    bonusInputStyles={{ height: hp('5%'), fontSize: hp('1.6%'), width: wp('56%'), paddingLeft: wp('2%') }}
                    handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
                  />
                  <FormField
                    title="name"
                    placeholder={"Enter name"}
                    bonusTextStyles={{ paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.2%') }}
                    containerStyles={{ marginBottom: hp('1%'), height: hp('11%') }}
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
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                        className="items-center justify-center"
                      >
                        <Image
                          source={icons.plus}
                          resizeMode="contain"
                          className="rounded-full"
                          style={{ tintColor: '#f2f9f1', width: hp('3%'), height: hp('3%') }}
                        />

                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
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
