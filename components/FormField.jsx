import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants';

const FormField = ({ title, value, placeholder,
  handleChangeText, textStyles, inputStyles, otherStyles, useIcon, iconSource, iconStyles, iconTint, hideText, ...props }) => {
  const [showText, setShowText] = useState(false);

  return (
    <View className={`bg-notFullWhite h-[100px] w-[250px] p-3 ${otherStyles}`}>
      {title && (
        <Text className={`font-pmedium text-gray-900 text-base ${textStyles}`}>{title}</Text>
      )}
      <View
        className="shadow-md shadow-black flex-row items-center"
        style={{ elevation: 5 }}
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