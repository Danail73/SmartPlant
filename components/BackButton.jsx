import { TouchableOpacity, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '../constants';
import { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';

const BackButton = ({iconStyles, positionStyles}) => {
  const router = useRouter(); 
  const scale = useSharedValue(1);

  // Define animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handle button press
  const handlePress = () => {
    scale.value = withTiming(1.2, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 });
    });
    setTimeout(() => {
      router.back();
    }, 200); // Wait for animation to complete before going back
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={`${positionStyles}`}
      style={{animatedStyle}}
      activeOpacity={0.7}
    >
      <Image
        source={icons.back}
        className={`w-11 h-11 ${iconStyles}`}
        style={{tintColor:'#f2f9f1'}}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
