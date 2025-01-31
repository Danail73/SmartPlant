import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

const Container = ({ children ,colors, statusBarStyle, areaStyles }) => {

  useEffect(() => {
    NavigationBar.setBehaviorAsync('overlay-swipe')
    NavigationBar.setVisibilityAsync('hidden')
  })

  return (
    <LinearGradient
      colors={[colors[0], colors[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar style={statusBarStyle} />
      <SafeAreaView style={styles.area} className={`${areaStyles}`}>{children}</SafeAreaView>
    </LinearGradient>
  )};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  area: {
    flex: 1,
  },
});

export default Container;
