import { View, Text, Dimensions, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import CustomButton from '../components/CustomButton';
import { icons } from '../constants';
import { useLanguage } from '../translations/i18n';
import LanguageOption from './LanguageOption';
import { useGlobalContext } from '../context/GlobalProvider';

const LanguageMenu = ({ langContainerStyles, langMenuStyles }) => {
    const { language, switchLanguage } = useGlobalContext();
    const iconRef = useRef(null);

    const langScale = useSharedValue(0);
    const menuTop = useSharedValue(0);
    const menuLeft = useSharedValue(0);

    const [visible, setVisible] = useState(false);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const openMenu = () => {
        setVisible(true);
        if (iconRef.current) {
            iconRef.current.measure((x, y, width, height, pageX, pageY) => {
                menuTop.value = y + 10;
                menuLeft.value = x - 23;
                langScale.value = withTiming(1, { duration: 200 });
            });
        }
    };

    const closeMenu = () => {
        langScale.value = withTiming(0, { duration: 100 }, () => {
            runOnJS(setVisible)(false);
        });
    };

    const changeLanguage = async (lang) => {
        await switchLanguage(lang);
        closeMenu();
    };

    const menuAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: langScale.value }],
            position:'absolute',
            top: menuTop.value,
            left: menuLeft.value,
            opacity: langScale.value
        };
    });

    return (
        <>
            <View
                ref={iconRef}
                className={`${langContainerStyles}`}
                style={{ zIndex: 36 }}
            >
                <CustomButton
                    containerStyles={'bg-notFullWhite rounded-full items-center justify-center'}
                    useAnimatedIcon={true}
                    imageSource={icons.languageAnimated}
                    iVisible={true}
                    width={40}
                    height={40}
                    textContainerStyles={'h-0 w-0'}
                    handlePress={() => {
                        if (!visible) {
                            openMenu()
                        }
                        else {
                            closeMenu()
                        }
                    }}
                />
            </View>
            {visible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={{ width: screenWidth, height: screenHeight, position: 'absolute', top: 0, left: 0, zIndex: 35 }}>
                        <Animated.View
                            className={`${langMenuStyles}`}
                            style={[menuAnimatedStyle, { transformOrigin: 'top'}]}
                        >
                            <View className="h-[0.1rem] w-[80%] bg-black " style={{ marginTop: '40%' }}></View>
                            <View className="w-[100%] items-start justify-center flex-col gap-1 pt-1 pl-2" style={{ marginTop: '6%' }}>
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