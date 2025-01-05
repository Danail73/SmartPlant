import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native';
import { icons } from '../constants'

const SearchInput = ({title, value, placeholder,
    handleChangeText, otherStyles, ...props}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="border-2 border-black-200 
      w-full h-16 px-4 bg-black rounded-2xl
      focus:border-secondary-100 items-center flex-row space-x-4">
            <TextInput
                className="text-base mt-0.5 text-white flex-1 font-pregular"
                value={value}
                placeholder={placeholder}
                placeholdertextColor='#7b7b8b'
                onChangeText={handleChangeText}
                secureTextEntry={title === ' Password' && !showPassword}
            />

            
            <TouchableOpacity onPress={() =>
                setShowPassword(!showPassword)}>
                <Image source={!showPassword ? icons.eye :
                    icons.eyeHide} className="w-6 h-6"
                    resizeMode='contain' />
            </TouchableOpacity>
        </View>
    )
}

export default SearchInput