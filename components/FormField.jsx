import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants';

const FormField = ({ title, value, placeholder,
  handleChangeText, textStyles, bonusTextStyles, inputStyles, bonusInputStyles, otherStyles, containerStyles, useIcon, iconSource, iconStyles, iconTint, hideText, ...props }) => {
  const [showText, setShowText] = useState(false);

  return (
    <View className={`bg-notFullWhite   p-3 ${otherStyles}`} style={containerStyles}>
      {title && (
        <Text className={`font-pmedium text-gray-900 text-base ${textStyles}`} style={bonusTextStyles}>{title}</Text>
      )}
      <View
        className=" flex-row items-center"
        
      >
        {useIcon && (
          <View className="items-center justify-center absolute z-20 pl-2">
            <Image
              source={iconSource}
              className={`min-w-5 min-h-5 max-w-10 max-h-10 ${iconStyles}`}
              style={{ tintColor: iconTint ? iconTint : 'gray' }}
              resizeMode='contain'
            />
          </View>
        )}
        {hideText ? (
          <>
            <TextInput
              className={`border w-[230px] mt-1 bg-white rounded-lg pl-[15%] ${inputStyles}`}
              style={{bonusInputStyles}}
              placeholder={placeholder}
              value={value}
              onChangeText={handleChangeText}
              secureTextEntry={!showText}
            />
            <TouchableOpacity
              onPress={() => setShowText(!showText)}
            >
              <Image
                source={!showText ? icons.eye : icons.eyeHide}
                className="w-6 h-6"
                resizeMode='contain'
              />
            </TouchableOpacity>
          </>
        ) : (
          <TextInput
            className={`border w-[230px] mt-1 bg-white rounded-lg pl-[15%] ${inputStyles}`}
            style={bonusInputStyles}
            placeholder={placeholder}
            placeholderTextColor={''}
            value={value}
            onChangeText={handleChangeText}
          />
        )}
      </View>
    </View>
  )
}

export default FormField