import { TouchableOpacity, Text, Image, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '../constants'
import AnimatedIcon from './AnimatedIcon'

//most used component
const CustomButton = ({ title, handlePress, containerStyles, bonusContainerStyles, 
  textStyles, bonusTextStyles, isLoading, useAnimatedIcon, imageSource, imageStyles, 
  bonusImageStyles, width, height, iVisible, disabled, imageContainerStyles, textContainerStyles, opacityStyles }) => {
  const [iconVisible, setIconVisible] = useState(false)

  // play icon animation when user press the button
  const handlePressIn = () => {
    setIconVisible(true);

    //waiting for the animation to complete
    setTimeout(() => setIconVisible(false), 500);
  };

  useEffect(() => {
    setIconVisible(iVisible)
  }, [])
  return (

    <View className={`items-center justify-center ${containerStyles}`} style={bonusContainerStyles}>
      <TouchableOpacity
        onPress={handlePress}
        className={`justify-center items-center ${isLoading ? 'opacity-50' : ''} ${opacityStyles}`}
        disabled={disabled}
        onPressIn={() => {
          handlePressIn();
        }}

      >
        {/* use AnimatedIcon for icons with animations and Image for icons without animations */}
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
              className={`${imageStyles}`}
              style={bonusImageStyles}
            />
          )}
        </View>
        {/* show button title */}
        <View className={`${textContainerStyles}`}>
          <Text className={`font-pbold ${textStyles}`} style={bonusTextStyles}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View >

  )
}

export default CustomButton