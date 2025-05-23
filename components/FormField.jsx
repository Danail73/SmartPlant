import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants';
import { hide } from 'expo-router/build/utils/splash';

const FormField = ({ title, value, placeholder, handleChangeText, textStyles,
  bonusTextStyles, inputStyles, bonusInputStyles, otherStyles, containerStyles,
  useIcon, iconSource, iconStyles, iconContainerStyles, bonusIconStyles, iconTint, hideText,hideTextStyles,  hideTextIconStyles, ...props }) => {
  const [showText, setShowText] = useState(false);

  return (
    <View className={`bg-notFullWhite   p-3 ${otherStyles}`} style={containerStyles}>
      {/* show title if it is not null */}
      {title && (
        <Text className={`font-pmedium text-gray-900 text-base ${textStyles}`} style={bonusTextStyles}>{title}</Text>
      )}
      <View
        className=" flex-row items-center"
      >
        {useIcon && (
          <View className="items-center justify-center z-20" style={iconContainerStyles}>
            <Image
              source={iconSource}
              className={`${iconStyles}`}
              style={[{ tintColor: iconTint ? iconTint : 'gray' }, bonusIconStyles]}
              resizeMode='contain'
            />
          </View>
        )}
        {/* input with hide/show option (mainly used for passwords) */}
        <TextInput
          className={`border w-[230px] mt-1 bg-white rounded-lg  ${inputStyles}`}
          style={bonusInputStyles}
          placeholder={placeholder}
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={hideText ? !showText : false}
          testID="passwordInput"
        />

        {/* eye icon to manage hide/show of the text */}
        {hideText && (
          <TouchableOpacity
            onPress={() => setShowText(!showText)}
            style={hideTextStyles}
          >
            <Image
              source={!showText ? icons.eye : icons.eyeHide}
              style={hideTextIconStyles}
              resizeMode='contain'
              testID="eyeIcon"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField