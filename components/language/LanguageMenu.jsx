import { View, Text, Dimensions, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import CustomButton from '../CustomButton';
import { icons } from '../../constants';
import LanguageOption from './LanguageOption';
import { useGlobalContext } from '../../context/GlobalProvider';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';

const LanguageMenu = ({ langContainerStyles, bonusLandContainerStyles, langMenuStyles, bonusLangMenuStyles }) => {
    const { language, switchLanguage } = useGlobalContext();
    const iconRef = useRef(null);

    const langScale = useSharedValue(0);
    const menuTop = useSharedValue(0);
    const menuLeft = useSharedValue(0);

    const [visible, setVisible] = useState(false);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    //function to open the menu just below the language menu icon
    const openMenu = () => {
        setVisible(true);
        if (iconRef.current) {
            iconRef.current.measure((x, y, width, height, pageX, pageY) => {
                menuTop.value = y + hp('2%');
                menuLeft.value = x - (hp('2.7%') > 30 ? 29 : hp('2.7%'));
                langScale.value = withTiming(1, { duration: 200 });
            });
        }
    };

    //function to close the menu
    const closeMenu = () => {
        langScale.value = withTiming(0, { duration: 100 }, () => {
            runOnJS(setVisible)(false);
        });
    };

    //function to change the app language
    const changeLanguage = async (lang) => {
        await switchLanguage(lang);
        closeMenu();
    };

    //using useAnimatedStyle for the language menu
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
                style={[{ zIndex: 36 }, bonusLandContainerStyles]}
            >
                {/* button to open the menu */}
                <CustomButton
                    containerStyles={'bg-notFullWhite rounded-full items-center justify-center'}
                    useAnimatedIcon={true}
                    imageSource={icons.languageAnimated}
                    iVisible={true}
                    width={hp('5%')}
                    height={hp('5%')}
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

            {/* show language menu if open */}
            {visible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={{ width: screenWidth, height: screenHeight, position: 'absolute', top: 0, left: 0, zIndex: 35 }}>
                        <Animated.View
                            className={`${langMenuStyles}`}
                            style={[menuAnimatedStyle, bonusLangMenuStyles, { transformOrigin: 'top'}]}
                        >
                            <View className="h-[0.1rem] w-[80%] bg-black " style={{ marginTop: hp('4%')}}></View>

                            {/* show language options */}
                            <View className="w-[100%] items-start justify-center flex-col" style={{height: '60%', paddingLeft: hp('1.5%'), paddingTop: hp('0.2%')}}>
                                {/* bulgarian */}
                                <LanguageOption
                                    title="BG"
                                    handlePress={() => changeLanguage('bg')}
                                    isVisible={language == 'bg'}
                                    textStyles={{fontSize: hp('2%') < 20 ? hp('2%') : 20}}
                                    containerStyles={{height: hp('3.4%')}}
                                />
                                {/* english */}
                                <LanguageOption
                                    title="EN"
                                    handlePress={() => changeLanguage('en')}
                                    isVisible={language == 'en'}
                                    textStyles={{fontSize: hp('2%') < 20 ? hp('2%') : 20}}
                                    containerStyles={{height: hp('3.4%')}}
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