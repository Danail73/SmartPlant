import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Searchbar } from 'react-native-paper'
import { icons } from '../constants'
import { TextInput } from 'react-native-gesture-handler'

const SearchBar = (containerStyles, searchStyles, textStyles, placeholder,value, onValueChange, onClear) => {
    return (
        <View className={`flex-row items-center bg-[#eee8f4] rounded-full h-[56px] w-[90%] px-4 ${containerStyles}`}>
            <Image
                source={icons.search}
                className="w-7 h-7"
                resizeMode='contain'
                style={{ tintColor: '#4d4752' }}
            />
            <TextInput
                className={`w-[75%] mx-4 text-lg font-pregular text-[#4d4752] py-0 justify-center items-center ${searchStyles} ${textStyles}`}
                placeholder={placeholder ? placeholder : 'Search...'}
                value={value}
                onChangeText={onValueChange}
            />
            <TouchableOpacity
                onPress={onClear}
                className="absolute right-4"
            >
                <Image
                    source={icons.close}
                    className="w-7 h-7"
                    resizeMode='contain'
                    style={{ tintColor: '#4d4752' }}
                />
            </TouchableOpacity>
        </View>
    )
}

export default SearchBar