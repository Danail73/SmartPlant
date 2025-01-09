import { View, Text, TextInput } from 'react-native'
import React from 'react'

const FormField = ({ title, value, placeholder,
     handleChangeText, textStyles,inputStyles,  otherStyles, ...props }) => {
  return (
    <View className={`bg-notFullWhite h-[100px] w-[250px] p-3 ${otherStyles}`}>
      <Text className={` text-lg font-pmedium text-gray-900 ${textStyles}`}>{title}</Text>
      <View 
        className="shadow-md shadow-black"
        style={{elevation:5}}
      >
        <TextInput
          className={`border-gray-50 border w-[230px] mt-1 bg-white rounded-lg ${inputStyles}`}
          placeholder={placeholder}
          value={value}
          onChange={handleChangeText}
        />
      </View>
    </View>
  )
}

export default FormField