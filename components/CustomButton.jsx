import { TouchableOpacity, Text, Image, View } from 'react-native'
import React from 'react'
import { images } from '../constants'

const CustomButton = ({ title, handlePress, containerStyles,
   textStyles, isLoading, imageSource, imageStyles }) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className={`justify-center
      items-center ${containerStyles}
      ${isLoading ? 'opacity-50' : '' }`}
      disabled={isLoading}
    >
        <View className="items-center justify-center">
          <Image
            source={imageSource}
            className={`w-[120] h-[120] ${imageStyles}`}
          />
          <Text className={`text-gray font-black text-2xl absolute ${textStyles}`}>
              {title}
          </Text>
        </View>
    </TouchableOpacity>
  )
}

export default CustomButton