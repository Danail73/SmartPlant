import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, Text } from 'react-native';
import { Menu, Divider, IconButton, Provider as PaperProvider } from 'react-native-paper';
import { icons } from '../constants';
import { router } from 'expo-router';
import { deletePlant, updatePlant } from '../lib/appwrite';
import FormField from './FormField';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

const PlantBoardMenu = ({ item }) => {
  const menuTranslateY = useSharedValue(0)
  const menuScale = useSharedValue(0)
  const rotation = useSharedValue(0);
  const [visible, setVisible] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    plantId: item.plantId,
    name: item.name
  })

  const openMenu = () => {
    setVisible(true);
    menuScale.value = withTiming(1, { duration: 300 })
    rotation.value = withTiming(90, { duration: 300 })
  }

  const closeMenu = () => {
    menuScale.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(setVisible)(false)
    })
    rotation.value = withTiming(0, { duration: 300 })
  }

  const openEdit = () => {
    setEdit(true)
  }

  const navigateToDevice = () => {
    router.push(`/device`);
  }

  const handleEditPlant = async () => {
    try {
      const response = await updatePlant(item.$id, form.plantId, form.name);
    } catch (error) {
      console.error(Error, error)
    }
  }

  const handleDeletePlant = async () => {
    try {
      const response = await deletePlant(item.$id);
    } catch (error) {
      console.error(Error, error)
    }
  }
  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: menuTranslateY.value }, { scale: menuScale.value }],
    };
  });

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    }
  })

  return (

    <View style={styles.container}>
      <Menu
        visible={visible}
        style={[menuAnimatedStyle, {transform: [{translateX:-20}, {translateY: -65}]}]}
        onDismiss={closeMenu}
        anchor={
          <Pressable onPress={openMenu}>
            <Animated.View style={rotationStyle}>
              <IconButton
                icon={icons.menu}
                iconColor='black'
                size={30}
              />
            </Animated.View>
          </Pressable>
        }
        contentStyle={styles.menuContent}
      >
        {edit && (
          <View
            style={{ position: 'absolute', transform: [{ translateX: -40 }, { translateY: -100 }] }}
          >
            <FormField
              title='name'
              otherStyles={'w-[140px] rounded-lg'}
              inputStyles={'w-[140px]'}
              handleChangeText={(e) => { setForm({ ...form, name: e }) }}
            />
          </View>
        )}
        {/* Menu Items */}
        <Menu.Item
          style={{ zIndex: 1000 }}
          onPress={() => {
            if (edit) {
              handleEditPlant();
              setEdit(false);
              closeMenu();
            }
            else {
              closeMenu();
              navigateToDevice();
            }
          }}
          title={(
            <View className="flex-row pl-5">
              <Image
                source={icons.edit}
                className="w-6 h-6"
                style={{ tintColor: 'blue' }}
                resizeMode='contain'
              />
              <Text className="font-pregular pl-1 text-lg" style={{ color: 'blue' }}>Edit</Text>
            </View>
          )}
        />
        <Menu.Item
          onPress={() => {
            handleDeletePlant();
            closeMenu();
          }}
          title={(
            <View className="flex-row pl-2">
              <Image
                source={icons.del}
                className="w-7 h-7"
                style={{ tintColor: 'red' }}
                resizeMode='contain'
              />
              <Text className="font-pregular pl-1 text-lg" style={{ color: 'red' }}>Delete</Text>
            </View>
          )}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -10,
    zIndex: 1000,
  },
  menuContent: {
    borderRadius: 10,
    width: 100,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default PlantBoardMenu;
