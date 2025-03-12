import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Text, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Menu, Divider, IconButton, Provider as PaperProvider, Portal } from 'react-native-paper';
import { icons } from '../constants';
import { router } from 'expo-router';
import { deletePlant, updatePlant, updatePlantUsers } from '../lib/appwrite';
import FormField from './FormField';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { useGlobalContext } from '../context/GlobalProvider';

const PlantBoardMenu = ({ item, addCallback, removeCallback }) => {
  const { user } = useGlobalContext()
  const iconRef = useRef(null);
  const menuScale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const menuTop = useSharedValue(0);
  const menuLeft = useSharedValue(0);
  const [visible, setVisible] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const isCreator = user.$id === item.users[0].$id

  const openMenu = () => {
    setVisible(true);
    if (iconRef.current) {
      iconRef.current.measure((x, y, width, height, pageX, pageY) => {
        menuTop.value = isCreator ? (pageY - height - 80) : (pageY - height - 40);
        menuLeft.value = isCreator ? (pageX - 40) : (pageX - 10);
        menuScale.value = withTiming(1, { duration: 200 });
        rotation.value = withTiming(90, { duration: 200 });
      });
    }
  }

  const closeMenu = () => {
    menuScale.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(setVisible)(false)
    })
    rotation.value = withTiming(0, { duration: 200 })
  }

  const navigateToDevice = () => {
    router.push(`/device`);
  }

  const handleDeletePlant = async () => {
    try {
      if (item.users[0].$id == user.$id) {
        const response = await deletePlant(item.$id);
      }
      else {
        const users = item.users.filter((item) => item.$id != user.$id)
        await updatePlantUsers(users)
      }

    } catch (error) {
      console.error(Error, error)
    }
  }
  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: menuScale.value }],
      top: menuTop.value,
      left: menuLeft.value,
    };
  });

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    }
  })

  return (
    <>
      <TouchableOpacity ref={iconRef} onPress={openMenu}>
        <Animated.View style={[rotationStyle, { left: 10 }]}>
          <IconButton
            icon={icons.menu}
            iconColor='black'
            size={30}
          />
        </Animated.View>
      </TouchableOpacity>
      {visible && (
        <Portal>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={{ width: screenWidth, height: screenHeight, position: 'absolute', top: 0, left: 0, zIndex: 2000 }}
              className="items-center"
            >
              <Animated.View
                style={
                  [menuAnimatedStyle,
                   styles.menuContent, 
                   {
                    width: isCreator ? styles.menuContent.width : 100,
                    height: isCreator ? styles.menuContent.height : 120
                   }]}
                className="absolute border"
              >
                <TouchableOpacity
                  style={{ zIndex: 1000 }}
                  onPress={() => {
                    closeMenu();
                    navigateToDevice();
                  }}
                >
                  <View className="flex-row my-2">
                    <Image
                      source={icons.edit}
                      className="w-6 h-6"
                      style={{ tintColor: 'blue' }}
                      resizeMode='contain'
                    />
                    <Text className="font-pregular pl-1 text-lg" style={{ color: 'blue' }}>Edit</Text>
                  </View>
                </TouchableOpacity>

                {isCreator && (
                  <>
                    <TouchableOpacity
                      style={{ zIndex: 1000 }}
                      onPress={() => {
                        closeMenu();
                        addCallback();
                      }}
                    >
                      <View className="flex-row my-2">
                        <Image
                          source={icons.addFriend}
                          className="w-7 h-7"
                          style={{ tintColor: 'green' }}
                          resizeMode='contain'
                        />
                        <Text className="font-pregular pl-1 text-lg" style={{ color: 'green' }}>Add Friend</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ zIndex: 1000 }}
                      onPress={() => {
                        closeMenu();
                        removeCallback();
                      }}
                    >
                      <View className="flex-row my-2">
                        <Image
                          source={icons.addFriend}
                          className="w-7 h-7"
                          style={{ tintColor: 'red' }}
                          resizeMode='contain'
                        />
                        <Text className="font-pregular pl-1 text-lg" style={{ color: 'red' }}>Remove Friend</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={{ zIndex: 1000 }}
                  onPress={() => {
                    closeMenu();
                    handleDeletePlant();
                  }}
                >
                  <View className="flex-row my-2">
                    <Image
                      source={icons.del}
                      className="w-7 h-7"
                      style={{ tintColor: 'red' }}
                      resizeMode='contain'
                    />
                    <Text className="font-pregular pl-1 text-lg" style={{ color: 'red' }}>Delete</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Portal>
      )}
    </>

  );
};

const styles = StyleSheet.create({
  container: {

  },
  menuContent: {
    backgroundColor: '#f2f9f1',
    borderRadius: 10,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default PlantBoardMenu;