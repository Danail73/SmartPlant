import { TouchableOpacity, Text, Image, View } from 'react-native'
import React from 'react'
import { images } from '../constants'

const CustomButton = ({ title, handlePress, containerStyles,
   textStyles, isLoading, imageSource, imageStyles, disabled }) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={`justify-center
      items-center ${containerStyles}
      ${isLoading ? 'opacity-50' : '' }`}
      disabled={disabled}
      
      
    >
        <View className="items-center justify-center">
          <Image
            source={imageSource}
            className={`w-[120] h-[120] ${imageStyles}`}
          />
          <Text className={`font-black text-2xl absolute ${textStyles}`}>
              {title}
          </Text>
        </View>
    </TouchableOpacity>
  )
}

export default CustomButton