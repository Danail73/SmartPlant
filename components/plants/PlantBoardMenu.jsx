import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, Portal } from 'react-native-paper';
import { icons } from '../../constants';
import { router } from 'expo-router';
import { deletePlant, updatePlantUsers } from '../../lib/appwrite';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { useGlobalContext } from '../../context/GlobalProvider';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { usePlantsContext } from '../../context/PlantsProvider';
import { BlurView } from 'expo-blur';

const PlantBoardMenu = ({ item, addCallback, removeCallback, menuStyle }) => {
  const { user } = useGlobalContext()
  const { setPlants, setActivePlant } = usePlantsContext();
  const iconRef = useRef(null);
  const menuScale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const menuTop = useSharedValue(0);
  const menuLeft = useSharedValue(0);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const isCreator = user.$id === item.users[0].$id

  //function to open menu just above the menu icon
  const openMenu = () => {
    setVisible(true);
    if (iconRef.current) {
      iconRef.current.measure((x, y, width, height, pageX, pageY) => {
        menuTop.value = isCreator ? (pageY - height - (hp('14.5%') > 135 ? 135 : hp('14.5%'))) : (pageY - height - 40);
        menuLeft.value = isCreator ? (pageX - width - (wp('6%') > 25 ? 25 : wp('6%'))) : (pageX - 10);
        menuScale.value = withTiming(1, { duration: 200 });
        rotation.value = withTiming(90, { duration: 200 });
      });
    }
  }

  //function to close the menu
  const closeMenu = () => {
    menuScale.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(setVisible)(false)
    })
    rotation.value = withTiming(0, { duration: 200 })
  }

  //function to go to the device page
  const navigateToDevice = () => {
    router.push(`/device`);
  }

  //function to delete/remove from list plant
  const handleDeletePlant = async () => {
    try {
      setIsLoading(true)
      // delete plant if user is creator
      if (item.users[0].$id == user.$id) {
        const response = await deletePlant(item.$id);
      }
      //else just remove it from user's list
      else {
        const users = item.users.filter((item) => item.$id != user.$id)
        await updatePlantUsers(item.$id, users)
        setPlants(prev => prev.filter(p => p.$id !== item.$id))
        setActivePlant(null);
      }

    } catch (error) {
      console.log(Error, error)
    }
    finally { setIsLoading(false) }
  }

  //using useAnimatedStyle for the menu
  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: menuScale.value }],
      top: menuTop.value,
      left: menuLeft.value,
    };
  });

  //rotate icon when opening/closing menu
  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    }
  })

  return (
    <>
      {isLoading && (
        <Portal>
          <BlurView
            className="w-full h-full items-center justify-center absolute z-50"
            intensity={70}
            tint='systemChromeMaterial'
          >
            <ActivityIndicator size={'large'} color={'green'} />
          </BlurView>
        </Portal>
      )}
      {/* show menu icon */}
      <TouchableOpacity
        ref={iconRef}
        onPress={openMenu}
        className="items-center justify-center absolute right-3"
        style={menuStyle}
        testID='menu-test'
      >
        <Animated.View className="" style={[rotationStyle]}>
          <Image
            source={icons.menu}
            style={menuStyle}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* show menu if open */}
      {visible && (
        <Portal>
          <TouchableWithoutFeedback onPress={closeMenu} testID='background-test'>
            <View style={{ width: screenWidth, height: screenHeight, position: 'absolute', top: 0, left: 0, zIndex: 2000 }}
              className="items-center"
            >
              <Animated.View
                style={
                  [menuAnimatedStyle,
                    styles.menuContent,
                    {
                      width: isCreator ? styles.menuContent.width : 100,
                      height: isCreator ? styles.menuContent.height : 120,
                      gap: hp('1%')

                    }]}
                className="absolute border"
              >
                {/* option to go to the device page for more control */}
                <TouchableOpacity
                  style={{ zIndex: 1000 }}
                  onPress={() => {
                    closeMenu();
                    navigateToDevice();
                  }}
                >
                  <View className="flex-row">
                    <Image
                      source={icons.edit}
                      style={{ tintColor: 'blue', width: hp('2.6%'), height: hp('2.6%'), maxWidth: 26, maxHeight: 26 }}
                      resizeMode='contain'
                    />
                    <Text className="font-pregular pl-1 " style={{ color: 'blue', fontSize: hp('2.2%') > 20 ? 20 : hp('2.2%') }}>Edit</Text>
                  </View>
                </TouchableOpacity>

                {/* options to add/remove friends to the plant's list */}
                {isCreator && (
                  <>
                    {/* option to add friend to the plant's list */}
                    <TouchableOpacity
                      style={{ zIndex: 1000 }}
                      onPress={() => {
                        closeMenu();
                        addCallback();
                      }}
                    >
                      <View className="flex-row">
                        <Image
                          source={icons.addFriend}
                          style={{ tintColor: 'green', width: hp('2.6%'), height: hp('2.6%'), maxWidth: 26, maxHeight: 26 }}
                          resizeMode='contain'
                        />
                        <Text className="font-pregular pl-1 " style={{ color: 'green', fontSize: hp('2.2%') > 20 ? 20 : hp('2.2%') }}>Add</Text>
                      </View>
                    </TouchableOpacity>

                    {/* option to remove friend to the plant's list */}
                    <TouchableOpacity
                      style={{ zIndex: 1000 }}
                      onPress={() => {
                        closeMenu();
                        removeCallback();
                      }}
                    >
                      <View className="flex-row">
                        <Image
                          source={icons.addFriend}
                          style={{ tintColor: 'red', width: hp('2.6%'), height: hp('2.6%'), maxWidth: 26, maxHeight: 26 }}
                          resizeMode='contain'
                        />
                        <Text className="font-pregular pl-1 " style={{ color: 'red', fontSize: hp('2.2%') > 20 ? 20 : hp('2.2%') }}>Remove</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                {/* option to delete/remove from list plant */}
                <TouchableOpacity
                  style={{ zIndex: 1000 }}
                  onPress={() => {
                    closeMenu();
                    handleDeletePlant();
                  }}
                >
                  <View className="flex-row ">
                    <Image
                      source={icons.del}
                      style={{ tintColor: 'red', width: hp('2.6%'), height: hp('2.6%'), maxWidth: 26, maxHeight: 26 }}
                      resizeMode='contain'
                    />
                    <Text className="font-pregular pl-1" style={{ color: 'red', fontSize: hp('2.2%') > 20 ? 20 : hp('2.2%') }}>Delete</Text>
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
  //style for the menu
  menuContent: {
    backgroundColor: '#f2f9f1',
    borderRadius: 10,
    width: hp('17%'),
    height: hp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 200,
    maxWidth: 170
  },
});

export default PlantBoardMenu;