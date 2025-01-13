import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Image, Text } from 'react-native';
import { Menu, Divider, IconButton, Provider as PaperProvider } from 'react-native-paper';
import { icons } from '../constants';
import { router } from 'expo-router';
import { deletePlant, updatePlant } from '../lib/appwrite';
import FormField from './FormField';

const PlantBoardMenu = ({ colors, item }) => {
  const [visible, setVisible] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    plantId: item.plantId,
    name: item.name
  })

  const expand = (value) => {
    Animated.timing(scale, {
      toValue: value,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  const openMenu = async () => {
    setVisible(true);

    Animated.parallel([
      Animated.timing(rotation, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = async () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);

      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    })
  }

  const openEdit = () => {
    setEdit(true)
  }

  const navigateToDevice = () => {
    router.push(`/device?plantId=${item.plantId}`);
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

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (

    <View style={styles.container}>
      <Menu
        visible={visible}
        style={{ transform: [{ translateY: -65 }, { translateX: -20 }], }}
        onDismiss={async () => {
          setEdit(false);
          await closeMenu()
        }}
        anchor={
          <Pressable onPress={async () => await openMenu()}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <IconButton
                icon={icons.menu}
                color={colors[0]}
                size={30}
              />
            </Animated.View>
          </Pressable>
        }
        contentStyle={styles.menuContent}
      >
        {edit && (
          <View
            style={{position: 'absolute', transform:[{translateX:-40}, {translateY:-100}]}}
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
              //openEdit();
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
