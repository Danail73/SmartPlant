import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { icons } from '../constants'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated'
import { useLanguage } from '../translations/i18n'

const LanguageOption = ({ title, handlePress, isVisible }) => {
    const { language } = useLanguage()
    const [checkVisible, setCheckVisible] = useState(false)
    const checkScale = useSharedValue(0);

    const showCheck = () => {
        setCheckVisible(true)
        checkScale.value = withTiming(1, { duration: 200 });
    }

    const closeCheck = () => {
        setCheckVisible(true)
        checkScale.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(setCheckVisible)(false)
        });
    }

    const langOptionAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: checkScale.value }],
            opacity: checkScale.value
        };
    });

    useEffect(() => {
        if (isVisible) {
            showCheck()
        }
        else {
            closeCheck()
        }
    }, [isVisible])

    return (
        <TouchableOpacity
            className="flex-row w-[100%]"
            onPress={() => {
                showCheck()
                handlePress();
            }}
        >
            <View className="flex-row items-center justify-center">
                <Text className="text-lg font-psemibold">{title}</Text>
                {checkVisible && (
                    <Animated.Image
                        source={icons.check}
                        className="w-8 h-8 mb-1"
                        style={langOptionAnimatedStyle}
                    />
                )}
            </View>
        </TouchableOpacity>
    )
}

export default LanguageOption