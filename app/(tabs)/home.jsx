import { FlatList, StyleSheet, Text, View, Image, Animated, TouchableOpacity, Dimensions, Alert } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import PlantBoardComponent from '../../components/PlantBoardComponent'
import { icons, images } from '../../constants'
import Container from '../../components/Container'
import { PaperProvider } from 'react-native-paper'
import { getAllPlants, createPlant, subscribeToPlants, updatePlantSensors, plantIdExists } from '../../lib/appwrite'
import { Modal } from 'react-native-paper'
import FormField from '../../components/FormField'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalContext } from '../../context/GlobalProvider'
import { usePlantsContext } from '../../context/PlantsProvider'
import { t } from '../../translations/i18n'
import useMqttClient from '../../api/mqtt/mqtt'



const Home = () => {
  const { user, language } = useGlobalContext();
  const { client, temperature, waterLevel, status, humidity, brightness, isReceiving } = useMqttClient();
  const [activeItem, setActiveItem] = useState(null);
  const { plants, setPlants, setActivePlant } = usePlantsContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const translateY = useRef(new Animated.Value(400)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
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
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 430, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 600, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setMenuVisible(false);
    });
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
    }
  }

  useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => unsubscribePlants()
  }, [])

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
      updateSensors();
    }, 300000)

    return () => clearInterval(interval)
  }, [activeItem])


  return (
    <PaperProvider>
      <Container
        colors={['#4ec09c', '#a8d981']}
        statusBarStyle={'light'}
      >
        <View className="px-10">
          <View className={`h-20 items-center justify-between flex-row ${language == 'bg' ? 'pl-0' : 'pl-4'} pt-4`}>
            <Text className={`text-notFullWhite font-pmedium ${language == 'bg' ? 'text-2xl' : 'text-3xl'}`}>{t('Home')}</Text>
            <Text className="text-notFullWhite font-pmedium text-3xl">{temperature}</Text>
          </View>

          {plants && plants.length > 0 && (
            <View className="flex-row items-center my-3">
              <Image
                source={images.good}
                className="w-[170px] h-[170px]"
                resizeMode='contain'
              />
              <View className="items-center justify-center pl-2">
                <Text className="font-pmedium text-notFullWhite text-xl">{status.statusMessage}</Text>
              </View>
            </View>
          )}
          {!plants || plants.length == 0 && (
            <View className="flex-row items-center my-3">
              <Image
                source={images.noResult}
                className="w-[170px] h-[170px]"
                resizeMode='contain'
              />
              <View className="items-center justify-center pl-2">
                <Text className="font-pmedium text-notFullWhite text-xl">Looks like you{'\n'}don't have plants</Text>
              </View>
            </View>
          )}

          <View style={{ overflow: 'visible' }}>
            <View className="justify-between flex-row px-4">
              <Text className="text-notFullWhite font-pmedium text-lg ">{t('Daily Plants')}</Text>
              <TouchableOpacity
                onPressOut={showModal}
              >
                <Image
                  source={icons.plus}
                  className="w-7 h-7"
                  resizeMode='contain'
                  style={{ tintColor: 'white' }}
                />
              </TouchableOpacity>
            </View>
            {(plants && plants.length > 0) ? (
              <FlatList
                data={plants || []}
                keyExtractor={(item) => item.$id || item.id.toString()}
                renderItem={({ item }) => (
                  <PlantBoardComponent item={item} isReceiving={isReceiving} />
                )}
                style={{ paddingLeft: (plants && plants.length == 1) ? 30 : 0 }}
                horizontal
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                decelerationRate="fast"
                pagingEnabled={true}
                snapToAlignment='center'
              />
            ) : (
              <View>
                <Text>{t('Looks like you still dont have any plants')}</Text>
              </View>
            )}
          </View>
        </View>
        <Modal
          visible={menuVisible}
          onDismiss={hideModal}
        >
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
              textStyles={'pl-[5%]'}
              inputStyles={'pl-[5%]'}
              handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
            />
            <FormField
              title="name"
              placeholder={"Enter name"}
              textStyles={'pl-[5%]'}
              inputStyles={'pl-[5%]'}
              handleChangeText={(e) => { setForm({ ...form, name: e }) }}
            />

            <View>
              <TouchableOpacity
                onPress={() => {
                  handleCreatePlant();
                  hideModal();
                }}
                className="w-16 h-16 rounded-full"
              >
                <LinearGradient
                  colors={['#fdb442', '#f69f2c']}
                  start={[0, 0]}
                  end={[1, 1]}

                  style={{
                    borderRadius: 35,
                  }}
                  className="items-center justify-center w-16 h-16"
                >
                  <Image
                    source={icons.plus}
                    resizeMode="contain"
                    className="w-8 h-8 rounded-full"
                    style={{ tintColor: '#f2f9f1' }}
                  />

                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      </Container>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  createMenu: {
    position: 'absolute',
    bottom: 100,
    right: 60,
    left: 60,
    height: 280,
    borderRadius: 20,
  }
});

export default Home;
