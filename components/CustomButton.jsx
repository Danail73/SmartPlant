import { TouchableOpacity, Text, Image, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '../constants'
import AnimatedIcon from './AnimatedIcon'

const CustomButton = ({ title, handlePress, containerStyles,
  textStyles, isLoading, useAnimatedIcon, imageSource, imageStyles, width, height, iVisible, disabled, imageContainerStyles, textContainerStyles, opacityStyles }) => {
  const [iconVisible, setIconVisible] = useState(false)

  const handlePressIn = () => {
    setIconVisible(true);

    setTimeout(() => setIconVisible(false), 500);
  };
  useEffect(() => {
    setIconVisible(iVisible)
  }, [])
  return (

    <View className={`items-center justify-center ${containerStyles}`}>
      <TouchableOpacity
        onPress={handlePress}
        className={`justify-center items-center ${isLoading ? 'opacity-50' : ''} ${opacityStyles}`}
        disabled={disabled}
        onPressIn={() => {
          handlePressIn();
        }}

      >
        <View className={`${imageContainerStyles}`}>
          {useAnimatedIcon ? (
            <AnimatedIcon
              iconSource={imageSource}
              isVisible={iconVisible}
              width={width}
              height={height}
            />

          ) : (
            <Image
              source={imageSource}
              className={`w-[120] h-[120] ${imageStyles}`}
            />
          )}
        </View>
        <View className={`${textContainerStyles}`}>
          <Text className={`font-black text-xl ${textStyles}`}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View >

  )
}

export default CustomButton