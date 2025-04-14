import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { icons } from '../../constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View
      className="items-center justify-center gap-1
      flex-col "
      style={{marginTop: focused ? 0 : hp('0.5%'), width: wp('11%'), height: hp('6%')}}
    >
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        style={{width: hp('3%'), height: hp('3%')}}
        className=""
      />
      {!focused ? (
        <Text
          className={`${focused ? 'font-psemibold' : 'font-pregular'}`}
          style={{ color: color, fontSize: hp('1.2%') }}
        >
          {name}
        </Text>
      ) : null}
    </View>
  );
};

const TabsLayout = () => {
  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#2b65e3',
          tabBarInactiveTintColor: '#BFBFBF',
          tabBarHideOnKeyboard:true,
          tabBarStyle: {
            position: 'absolute',
            bottom: hp('4%'),
            left:30,
            right:30,
            marginHorizontal: '9%',
            width: '80%',
            alignSelf: 'center',
            backgroundColor: '#f2f9f1',
            borderRadius: 40,
            height: hp('7.5%'),
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            paddingHorizontal: 20,
            paddingTop: 12,
            zIndex: 30,
            alignContent:'center',
            justifyContent:'center'
          },
        }}
      >
        <Tabs.Screen
          name="home"
          style={{ paddingTop:0 }}
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
          style={{  }}
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
          style={{ paddingTop: 0 }}
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
  );
};

export default TabsLayout;
