import { View, Text, Dimensions, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import CustomButton from '../components/CustomButton';
import { icons } from '../constants';
import { useLanguage } from '../translations/i18n';
import LanguageOption from './LanguageOption';
import { useGlobalContext } from '../context/GlobalProvider';

const LanguageMenu = ({ langContainerStyles, langMenuStyles }) => {
    const { language, switchLanguage } = useGlobalContext()
    const [langVisible, setLangVisible] = useState(false);
    const langScaleY = useSharedValue(0);
    const checkScale = useSharedValue(0);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

    const changeLanguage = async (lang) => {
        await switchLanguage(lang);
    }

    const showMenu = () => {
        setLangVisible(true);
        langScaleY.value = withTiming(1, { duration: 200 })
    }

    const closeMenu = () => {
        langScaleY.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setLangVisible)(false)
        })
    }

    const showCheck = () => {
        checkScale.value = withTiming(1, { duration: 200 });
    }

    const langAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scaleY: langScaleY.value }],
            opacity: langScaleY.value
        };
    });

    return (
        <>
            <View className={`${langContainerStyles}`} style={{ zIndex: 36 }}>
                <CustomButton
                    containerStyles={'bg-notFullWhite rounded-full items-center justify-center'}
                    useAnimatedIcon={true}
                    imageSource={icons.languageAnimated}
                    iVisible={true}
                    width={40}
                    height={40}
                    textContainerStyles={'h-0 w-0'}
                    handlePress={() => {
                        if (!langVisible) {
                            showMenu()
                        }
                        else {
                            closeMenu()
                        }
                    }}
                />
            </View>
            {langVisible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={{ width: screenWidth, height: screenHeight, position: 'absolute', top: 0, left: 0, zIndex: 35 }}>
                        <Animated.View
                            className={`${langMenuStyles}`}
                            style={[langAnimatedStyle, { transformOrigin: 'top' }]}
                        >
                            <View className="h-[0.1rem] mt-[45%] w-[80%] bg-black"></View>
                            <View className="w-[100%] mt-[2%] items-start justify-center flex-col gap-1 pt-1 pl-2">
                                <LanguageOption
                                    title="BG"
                                    handlePress={() => changeLanguage('bg')}
                                    isVisible={language == 'bg'}
                                />
                                <LanguageOption
                                    title="EN"
                                    handlePress={() => changeLanguage('en')}
                                    isVisible={language == 'en'}
                                />
                            </View>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </>
    )
}

export default LanguageMenu