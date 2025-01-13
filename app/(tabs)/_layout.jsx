import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { icons } from '../../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { PaperProvider, Modal } from 'react-native-paper';
import FormField from '../../components/FormField';
import { getCurrentUser } from '../../lib/appwrite';
import { createPlant } from '../../lib/appwrite';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      className="items-center justify-center gap-1 min-w-[50px]
      flex-col"
      style={{ paddingTop: focused ? 1 : 11 }}
    >
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-8 h-8"
      />
      {!focused ? (
        <Text
          className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}
          style={{ color: color }}
        >
          {name}
        </Text>
      ) : null}
    </View>
  );
};

const TabsLayout = () => {
  return (
    <PaperProvider>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#2b65e3',
          tabBarInactiveTintColor: '#BFBFBF',
          tabBarStyle: {
            position: 'absolute',
            bottom: 30,
            marginHorizontal: 38,
            width: '80%',
            alignSelf: 'center',
            backgroundColor: '#f2f9f1',
            borderRadius: 40,
            height: 70,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            paddingHorizontal: 20,
            paddingTop: 12,
            zIndex: 30,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          style={{ paddingTop: 20 }}
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="friends"
          style={{ paddingTop: 20 }}
          options={{
            title: 'Friends',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.friends}
                color={color}
                name="Friends"
                focused={focused}
              />
            ),
          }}
        />


        <Tabs.Screen
          name="profile"
          style={{ paddingTop: 20 }}
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    color: '#2b65e3',
    marginTop: 20,
    fontSize: 16,
  },
  createMenu: {
    position: 'absolute',
    bottom: 100,
    right: 60,
    left: 60,
    height: 250,
    borderRadius: 20,
  }
});

export default TabsLayout;
