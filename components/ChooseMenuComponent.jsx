import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import FriendComponent from './FriendComponent'
import { LinearGradient } from 'expo-linear-gradient'

const ChooseMenuComponent = ({ item, addItem, discardItem }) => {
    const [isSelected, setIsSelected] = useState(false)

    return (
        <View className="flex-row items-center gap-3">
            <FriendComponent item={item.friend} otherStyles={'w-[270px]'} />
            <TouchableOpacity
                onPress={() => {
                    if (isSelected)
                        discardItem(item)
                    else
                        addItem(item)
                    setIsSelected(!isSelected)
                }}
            >
                <LinearGradient
                    colors={isSelected ? ['#0000FF', '#0096FF'] : ['#f2f9f1', '#f2f9f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 35 }}
                >
                    <View className={`w-8 h-8 border rounded-full`}></View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    )
}

export default ChooseMenuComponent