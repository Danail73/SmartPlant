import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

const Container = ({ children, colors, statusBarStyle }) => {
  const timeoutRef = useRef(null); // Ref to store the timeout ID

  // Function to hide the navigation bar
  const hideNavigationBar = async () => {
    await NavigationBar.setVisibilityAsync('hidden');
  };

  // Function to manage visibility and timeout
  const checkVisibility = async () => {
    const isVisible = await NavigationBar.getVisibilityAsync();
    if (isVisible === 'visible') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      timeoutRef = setTimeout(() => {
        hideNavigationBar();
        timeoutRef.current = null;
      }, 2000);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkVisibility, 500);

    return () => {
      clearInterval(interval); 
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); 
      }
    };
  }, [timeoutRef]);

  return (
    <LinearGradient
      colors={[colors[0], colors[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar style={statusBarStyle} />
      <SafeAreaView style={styles.area}>{children}</SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  area: {
    flex: 1,
  },
});

export default Container;
