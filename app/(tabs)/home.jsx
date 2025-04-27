import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, TouchableWithoutFeedback, Alert, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import PlantBoardComponent from '../../components/plants/PlantBoardComponent'
import { icons, images } from '../../constants'
import Container from '../../components/Container'
import { PaperProvider } from 'react-native-paper'
import { createPlant, subscribeToPlants, updatePlantSensors, plantIdExists, updatePlantUsers, createPlantAdmin } from '../../lib/appwrite'
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
  const { user, language, account } = useGlobalContext();
  const { temperature, waterLevel, status, humidity, brightness, isReceiving } = useMqttContext();
  const { friends } = useFriendsContext();
  const { plants, setPlants, setActivePlant, activePlant, setActiveId, fetchRealTime } = usePlantsContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [adminMenuVisible, setAdminMenuVisible] = useState(false);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [addVisible, setAddVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);

  //setting up a form for plantId and name needed to create plant
  const [form, setForm] = useState({
    plantId: '',
    name: '',
  });

  //setting up data object for the chart
  const [data, setData] = useState({
    time: activePlant ? activePlant.time : [],
    temperature: activePlant ? activePlant.temperature : [],
    humidity: activePlant ? activePlant.humidity : [],
    brightness: activePlant ? activePlant.brightness : [],
    water: activePlant ? activePlant.water : [],
  })

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  //managing show/hide of the keyboard so other components show correctly
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

  //function to clear form
  const clearForm = () => {
    setForm({ plantId: '', name: '' })
  }

  //function to create a plant
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

  //function for admin to create a plant
  const handleAdminCreate = async () => {
    if (!form.plantId) {
      Alert.alert("PlantId must have value")
    }
    else {
      try {
        await createPlantAdmin(form.plantId);
      }
      catch (error) {
        console.log(error);
      }
      finally {
        clearForm();
      }
    }
  }

  //function to show menu to create plants
  const showModal = (isAdminMenu) => {
    if (!isAdminMenu) {
      setMenuVisible(true)
    } else {
      setAdminMenuVisible(true);
    }
    scale.value = withTiming(1, { duration: 200 })
    opacity.value = withTiming(1, { duration: 200 })
  };

  //function to hide menu for creating plants
  const hideModal = (isAdminMenu) => {
    scale.value = withTiming(0, { duration: 200 }, () => {
      if (!isAdminMenu) {
        runOnJS(setMenuVisible)(false)
      } else {
        runOnJS(setAdminMenuVisible)(false)
      }
    })
    opacity.value = withTiming(0, { duration: 200 })
  };

  //function to handle Flatlist component change of the visible items
  const viewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActivePlant(viewableItems[0].item)
      setActiveId(viewableItems[0].item.$id);
    }
  }, []);

  const viewConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  //function called to handle updates in the 'plants' collection - updating activePlant and plants object it the provider
  const handlePlantUpdated = useCallback((response) => {
    try {
      const eventType = response.events[0];
      const updatedItem = response.payload;

      if (eventType.includes('update')) {
        const updatedPlant = plants.find((p) => p.$id == updatedItem.$id);
        if (updatedPlant && (updatedPlant?.temperature.at(-1) != updatedItem.temperature.at(-1))) {
          setPlants((previous) => previous.map(
            (item) => item.$id == updatedItem.$id ? updatedItem : item
          ));
        } else {
          fetchRealTime();
        }
      } else {
        fetchRealTime();
      }

      if (activePlant?.$id === updatedItem.$id) {
        setActivePlant(updatedItem);
        setActiveId(updatedItem.$id);
      }
    } catch (error) {
      console.log(error);
    }
  }, [plants, activePlant, setPlants, setActivePlant, setActiveId, fetchRealTime]);


  //using useAnimatedStyle for the create-plants menu
  const createMenuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  })

  //function to get items from the AsyncStorage by key
  const getStorageItem = async (key) => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      activePlant.$id
      console.log(error)
    }
  }

  //subscribing to 'plants' collection
  useEffect(() => {
    const unsubscribe = subscribeToPlants(user.$id, handlePlantUpdated);
    return () => unsubscribe();
  }, [handlePlantUpdated, user?.$id])

  //function to get the current time for the chart in specific format
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

  //function to update sensor values of the plant in the database
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
  
  //function to check if sensor values should be updated
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

  //repeat the check in every 5 mins and when activePlant changes
  useEffect(() => {
    const interval = setInterval(() => {
      update()
    }, 300000)

    return () => clearInterval(interval)
  }, [activePlant])

  //clear data for chart when activePlant or user changes
  useEffect(() => {
    if (activePlant) {
      setData({
        time: activePlant?.time,
        temperature: activePlant?.temperature,
        humidity: activePlant?.humidity,
        brightness: activePlant?.brightness,
        water: activePlant?.water,
      })
    }
    else {
      setData({
        time: [],
        temperature: [],
        humidity: [],
        brightness: [],
        water: [],
      })
    }
  }, [activePlant, user])


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
            <Text className="text-notFullWhite font-pmedium" style={{ fontSize: hp('3%') }}>{temperature ? temperature + '°C' : ''}</Text>
          </View>

          {/* show current activePlant status message if user has plants */}
          {plants && plants.length > 0 && (
            <View
              className="flex-row items-center"
              style={{ marginVertical: hp('2%') }}
            >
              <Image
                source={images.good}
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
          {/* show noResult image if user does not have plants */}
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
              <View
                className="flex-row items-center justify-center gap-3"
              >
                {/* show special create option if user is administrator */}
                {(account && account.prefs.role === 'admin') && (
                  <TouchableOpacity
                    onPressOut={() => showModal(true)}
                  >
                    <Image
                      source={icons.plantAdmin}
                      resizeMode='contain'
                      style={{ tintColor: 'white', width: hp('3%'), height: hp('3%') }}
                    />
                  </TouchableOpacity>
                )}
                {/* show create-plant option for every user */}
                <TouchableOpacity
                  onPressOut={() => showModal(false)}
                >
                  <Image
                    source={icons.plus}
                    resizeMode='contain'
                    style={{ tintColor: 'white', width: hp('2.5%'), height: hp('2.5%') }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* show list of plant components if user has plants */}
            {(plants && plants.length > 0) ? (
              <View style={{ overflow: 'visible' }}>
                <FlatList
                  data={plants || []}
                  keyExtractor={(item) => item.$id}
                  renderItem={({ item }) => (
                    <PlantBoardComponent
                      item={item}
                      isReceiving={isReceiving}
                      isActive={activePlant?.$id == item.$id}
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
              //show message if not
              <View>
                <Text>{t('Looks like you still dont have any plants')}</Text>
              </View>
            )}
          </View>

          {/* setting the chart to show changes in plant's sensor values */}
          <Chart data={data} width={wp('100%')} height={hp('33%')} containerStyles={{ marginTop: hp('2%') }} />
        </View>

        {/* show create menu if user opens it */}
        {menuVisible && (
          <TouchableWithoutFeedback onPress={() => hideModal(false)}>
            <View style={{ width: wp('100%'), height: hp('100%'), position: 'absolute', top: 0, left: 0, zIndex: 35 }}>
              <BlurView
                className="items-center justify-center"
                style={{ width: wp('100%'), height: hp('100%'), ...StyleSheet.absoluteFillObject }}
                intensity={40}
                tint='dark'
              >
                <Animated.View
                  className={`bg-notFullWhite items-center justify-center`}
                  style={[
                    styles.createMenu, createMenuAnimatedStyle, { bottom: hp('1%') < 10 ? hp('1%') + keyboardHeight : 130 + keyboardHeight }
                  ]}
                >
                  {/* input for the plantId of the plant */}
                  <FormField
                    title="plantId"
                    placeholder={"Enter plantId"}
                    bonusTextStyles={{ paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.3%') }}
                    containerStyles={{ height: hp('11%') }}
                    bonusInputStyles={{ height: hp('5%'), fontSize: hp('1.6%'), width: wp('56%'), paddingLeft: wp('2%') }}
                    handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
                  />

                  {/* input for the name of the plant*/}
                  <FormField
                    title="name"
                    placeholder={"Enter name"}
                    bonusTextStyles={{ paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.2%') }}
                    containerStyles={{ marginBottom: hp('1%'), height: hp('11%') }}
                    bonusInputStyles={{ height: hp('5%'), fontSize: hp('1.6%'), width: wp('56%'), paddingLeft: wp('2%') }}
                    handleChangeText={(e) => { setForm({ ...form, name: e }) }}
                  />

                  {/* button to call create-plant function*/}
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        handleCreatePlant();
                        hideModal(false);
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

        {/* showing createMenu for admins when admin opens it */}
        {adminMenuVisible && (
          <TouchableWithoutFeedback onPress={() => hideModal(true)}>
            <View style={{ width: wp('100%'), height: hp('100%'), position: 'absolute', top: 0, left: 0, zIndex: 35 }}>
              <BlurView
                className="items-center justify-center"
                style={{ width: wp('100%'), height: hp('100%'), ...StyleSheet.absoluteFillObject }}
                intensity={40}
                tint='dark'
              >
                <Animated.View
                  className={`bg-notFullWhite items-center justify-center`}
                  style={[
                    styles.adminCreateMenu, createMenuAnimatedStyle, { bottom: hp('1%') < 10 ? hp('1%') + keyboardHeight : 130 + keyboardHeight }
                  ]}
                >
                  {/* input for the plantId of the plant */}
                  <FormField
                    title="plantId"
                    placeholder={"Enter plantId"}
                    bonusTextStyles={{ paddingLeft: wp('1%'), fontSize: hp('1.7%'), marginBottom: hp('0.3%') }}
                    containerStyles={{ height: hp('11%') }}
                    bonusInputStyles={{ height: hp('5%'), fontSize: hp('1.6%'), width: wp('56%'), paddingLeft: wp('2%') }}
                    handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
                  />
                  <View>
                    {/* button to call create function */}
                    <TouchableOpacity
                      onPress={() => {
                        handleAdminCreate();
                        hideModal(true);
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

        {/* showing menu to add friends to a plant when user opens it */}
        {addVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <ChooseFriendsMenu
                friends={friends
                  .filter((item) => !activePlant?.users.some((u) => u.$id === item.friend.$id))
                  .map((item) => item.friend)}
                cancel={() => {
                  setAddVisible(false)
                }}
                withRequest={false}
                currentUser={user}
                title={'Choose friends to add'}
                buttonTitle={'Add'}
                fn={async (list) => {
                  if (activePlant) {
                    const newUsers = [...activePlant?.users];
                    list.forEach((item) => {
                      newUsers.push(item)
                    })
                    const response = await updatePlantUsers(activePlant?.$id, newUsers)
                  }
                }}
              />
            </BlurView>
          </SafeAreaView>
        )}

        {/* showing menu to remove friends from a plant when user opens it */}
        {removeVisible && (
          <SafeAreaView className="flex-1 w-full h-full absolute">
            <BlurView
              className="h-[104%] w-[100%] items-center justify-center"
              intensity={100}
              tint='systemUltraThinMaterial'
            >
              <ChooseFriendsMenu
                friends={activePlant?.users.filter((item) => item.$id != user.$id)}
                cancel={() => {
                  setRemoveVisible(false)
                }}
                currentUser={user}
                withRequest={false}
                title={'Choose friends to remove'}
                buttonTitle={'Remove'}
                fn={async (list) => {
                  if (activePlant) {
                    try {
                      let newUsers = activePlant.users.filter(
                        (u) => !list.some((item) => u.$id === item.$id)
                      );
                      const response = await updatePlantUsers(activePlant.$id, newUsers)
                    } catch (error) {
                      console.log(error)
                    }
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
  //style for every user's create menu
  createMenu: {
    position: 'absolute',
    bottom: 100,
    right: wp('15%'),
    left: wp('15%'),
    height: hp('34%'),
    borderRadius: 20,
  },
  //style for admin's create menu
  adminCreateMenu: {
    position: 'absolute',
    bottom: 100,
    right: wp('15%'),
    left: wp('15%'),
    height: hp('20%'),
    borderRadius: 20,
  }
});

export default Home;
