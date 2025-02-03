import { FlatList, StyleSheet, Text, View, Image, Animated, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import PlantBoardComponent from '../../components/PlantBoardComponent'
import { icons, images } from '../../constants'
import Container from '../../components/Container'
import { PaperProvider } from 'react-native-paper'
import { getAllPlants, createPlant, subscribeToPlants } from '../../lib/appwrite'
import { Modal } from 'react-native-paper'
import FormField from '../../components/FormField'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalContext } from '../../context/GlobalProvider'
import { usePlantsContext } from '../../context/PlantsProvider'



const Home = () => {
  const { user } = useGlobalContext();
  const [activeItem, setActiveItem] = useState(null);
  const {plants, setPlants} = usePlantsContext();
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
    }
  }, []);

  const viewConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const handlePlantUpdated = (response) => {
    console.log(response.payload)
    const eventType = response.event;
    console.log(eventType)
    const updatedItem = response.payload
    if (eventType.includes('delete')) {
      setPlants((previous) => previous.filter((item) => item.$id != updatedItem.$id))
    }
    else if (eventType.includes('create')) {
      setPlants((previous) => [...previous, updatedItem])
    }
    else {
      setPlants((previous) => previous.filter(
        (item) => item.$id == updatedItem.$id ? updatedItem : item
      ))
    }
  }

  /*useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => unsubscribePlants
  }, [])

  useEffect(() => {
    fetchPlants()
  })*/

  return (
    <PaperProvider>
      <Container
        colors={['#4ec09c', '#a8d981']}
        statusBarStyle={'light'}
      >
        <View className="px-10">
          <View className="h-20 items-center justify-between flex-row pl-4 pt-4">
            <Text className="text-notFullWhite font-pmedium text-3xl">Home</Text>
            <Text className="text-notFullWhite font-pmedium text-3xl">25 °C</Text>
          </View>

          {plants && plants.length > 0 && (
            <View className="flex-row items-center my-3">
              <Image
                source={images.good}
                className="w-[170px] h-[170px]"
                resizeMode='contain'
              />
              <View className="items-center justify-center pl-2">
                <Text className="font-pmedium text-notFullWhite text-xl">Everything{'\n'}good here!</Text>
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
              <Text className="text-notFullWhite font-pmedium text-lg ">Daily Plants</Text>
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
                  <PlantBoardComponent item={item} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                decelerationRate="fast"
              />
            ) : (
              <View>
                <Text>Looks like you don't have plants yet</Text>
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
              textStyles={'pl-3'}
              inputStyles={''}
              handleChangeText={(e) => { setForm({ ...form, plantId: e }) }}
            />
            <FormField
              title="name"
              placeholder={"Enter name"}
              textStyles={'pl-3'}
              handleChangeText={(e) => { setForm({ ...form, name: e }) }}
            />

            <View>
              <TouchableOpacity
                onPress={() => {
                  if (menuVisible) {
                    handleCreatePlant();
                    hideModal();
                  } else {
                    showModal();
                  }
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
