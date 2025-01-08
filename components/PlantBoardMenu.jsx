import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Image, Text } from 'react-native';
import { Menu, Divider, IconButton, Provider as PaperProvider } from 'react-native-paper';
import { icons } from '../constants';
import { router } from 'expo-router';

const PlantBoardMenu = ({ colors, plantId }) => {
  const [visible, setVisible] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const [menuAlignment, setMenuAlignment] = useState('left');

  const openMenu = () => {
    setVisible(true);

    Animated.parallel([
      Animated.timing(rotation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.timing(scale, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      // After the menu is fully closed, update visibility
      setVisible(false);
  
      // Then, rotate the icon back
      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const navigateToDevice = () => {
    router.push(`/device?plantId=${plantId}`);
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const handleLayout = (event) => {
    const { x } = event.nativeEvent.layout; // Get the X position of the component
    if (x > screenWidth / 2) {
      setMenuAlignment('right'); // Closer to the right side
    } else {
      setMenuAlignment('left'); // Closer to the left side
    }
  };

  // Dynamic alignment for the menu
  const translateXValue = menuAlignment === 'right' ? 30 : -20;

  return (

    <View style={styles.container}>
      <Menu
        visible={visible}
        style={{transform: [{ translateY: -65 }, { translateX: translateXValue }]}}
        onDismiss={closeMenu}
        anchor={
          <Pressable onPress={openMenu}>
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
        {/* Menu Items */}
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigateToDevice()
          }}
          title={(
            <View className="flex-row pl-5">
              <Image
                source={icons.edit}
                className="w-6 h-6"
                style={{tintColor:'blue'}}
                resizeMode='contain'
              />
              <Text className="font-pregular pl-1 text-lg" style={{color:'blue'}}>Edit</Text>
            </View>
          )}
        />
        <Menu.Item
          onPress={() => {
            console.log(`Delete plant ${plantId}`);
            closeMenu();
          }}
          title={(
            <View className="flex-row pl-2">
              <Image
                source={icons.del}
                className="w-7 h-7"
                style={{tintColor:'red'}}
                resizeMode='contain'
              />
              <Text className="font-pregular pl-1 text-lg" style={{color:'red'}}>Delete</Text>
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
  menu: {
    transform: [{ translateY: -75 }, { translateX: -20 }]
  },
  menuContent: {
    borderRadius: 10,
    width: 100,
    height: 120,
    justifyContent: 'center',
    alignItems:'center'
  },
});

export default PlantBoardMenu;
