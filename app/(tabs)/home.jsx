import { FlatList, SafeAreaView, StyleSheet, Text, View, Image, Animated, TouchableOpacity, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import PlantBoardComponent from '../../components/PlantBoardComponent'
import { icons, images } from '../../constants'
import Container from '../../components/Container'
import { PaperProvider } from 'react-native-paper'
import { getAllPlants, createPlant, getCurrentUser } from '../../lib/appwrite'
import { Modal } from 'react-native-paper'
import FormField from '../../components/FormField'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalContext } from '../../context/GlobalProvider'


const Home = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [plants, setPlants] = useState([])
  const [menuVisible, setMenuVisible] = useState(false);
  const translateY = useRef(new Animated.Value(400)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [form, setForm] = useState({
    plantId: '',
    name: '',
  });
  const {user, setUser, isLoggedIn} = useGlobalContext();

  

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

  const fetchPlants = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        try {
          const plants = await getAllPlants();
          if (plants) {
            setPlants(plants);
          }
          else {
            //no plants yet
          }
        } catch (error) {
          console.log(error)
        }
      }
      else {
        //no plants yet
      }
    } catch (error) { }
  }

  const viewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item);
    }
  }, []);

  const viewConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlants();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeItem]);

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
            />
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

            <LinearGradient
              colors={['#fdb442', '#f69f2c']}
              start={[0, 0]}
              end={[1, 1]}

              style={{
                borderRadius: 35,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
              className="items-center justify-center w-16 h-16"
            >
              <Pressable
                onPress={() => {
                  if (menuVisible) {
                    handleCreatePlant();
                    hideModal();
                  } else {
                    showModal();
                  }
                }}
                className="w-full h-full rounded-full items-center justify-center"
              >
                <Image
                  source={icons.plus}
                  resizeMode="contain"
                  className="w-8 h-8 rounded-full"
                  style={{ tintColor: '#f2f9f1' }}
                />
              </Pressable>

            </LinearGradient>
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
