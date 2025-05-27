import { View, Text, Image, TouchableOpacity, Animated, FlatList } from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { icons } from '../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'
import FriendComponent from './FriendComponent'
import { t } from '../../translations/i18n'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

const RequestMenu = ({ onPress, requestFriends, invitedFriends, setIsLoading }) => {
    const { user } = useGlobalContext();
    const [upperVisible, setUpperVisible] = useState(false)
    const [bottomVisible, setBottomVisible] = useState(false)
    const rotationUpper = useRef(new Animated.Value(0)).current;
    const rotationBottom = useRef(new Animated.Value(0)).current;

    //function to open menu for incoming invites (sent to the current user)
    const toggleUpper = async () => {
        setUpperVisible(!upperVisible)
        let value;
        if (upperVisible)
            value = 0;
        else
            value = 1;

        Animated.timing(rotationUpper, {
            toValue: value,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    //function to open ongoing invites (sent by the current user)
    const toggleBottom = () => {
        setBottomVisible(!bottomVisible)
        let value;
        if (bottomVisible)
            value = 0;
        else
            value = 1;

        Animated.timing(rotationBottom, {
            toValue: value,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    //style to rotate arrow icon of the menu
    const rotateInterpolateUpper = rotationUpper.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    const rotateInterpolateBottom = rotationBottom.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });



    return (
        <View
            className="absolute bg-notFullWhite right-0 rounded-l-lg border-l border-t border-b"
            style={{ width: wp('70%'), top: hp('7%'), height: hp('80%'), minHeight: 730, borderWidth: hp('0.1rem') }}
        >
            <TouchableOpacity
                onPress={toggleUpper}
            >
                <Animated.View
                    className="w-[100%]  flex-row items-center "
                >
                    <Animated.Image
                        style={{ transform: [{ rotate: rotateInterpolateUpper }], width: hp('2%'), height: hp('2%'), margin: hp('1%') }}
                        source={icons.leftArrow}
                    />
                    <Text className="font-pmedium" style={{ fontSize: hp('1.7%') }}>{t('Incoming Requests')}</Text>

                    {/* indicator to show the count of invites */}
                    {requestFriends.length > 0 && (
                        <View
                            className="rounded-full border items-center justify-center bg-red-600 ml-[2%]"
                            style={{ width: hp('3%'), height: hp('3%') }}
                        >
                            <Text className="text-white" style={{ fontSize: hp('1.6%') }}>{requestFriends.length > 99 ? '99+' : requestFriends.length}</Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* show list with incoming invites */}
            {upperVisible && (
                <View className="h-[40%] border">
                    <FlatList
                        data={requestFriends || []}
                        keyExtractor={(item) => item.friend.$id}
                        renderItem={({ item }) => (
                            <FriendComponent
                                item={item.friend}
                                titleStyles={{fontSize: hp('1.7%')}}
                                iconStyles={{width: hp('5%'), height: hp('5%')}}
                                containerStyles={{width: '99%'}}
                                requestId={item.request.$id}
                                isPending={true}
                                forInvite={false}
                                setIsLoading={setIsLoading}
                            />
                        )}
                        className="my-2"
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            <TouchableOpacity
                onPress={toggleBottom}
            >
                <Animated.View
                    className="w-[100%] border-t border-b  flex-row items-center"
                >
                    <Animated.Image
                        style={{ transform: [{ rotate: rotateInterpolateBottom }], width: hp('2%'), height: hp('2%'), margin: hp('1%') }}
                        source={icons.leftArrow}
                    />
                    <Text className="font-pmedium" style={{ fontSize: hp('1.7%') }}>{t('Pending Invites')}</Text>

                    {/* indicator to show the count of invites */}
                    {invitedFriends.length > 0 && (
                        <View
                            className="rounded-full border items-center justify-center bg-gray-500 ml-[2%]"
                            style={{ width: hp('3%'), height: hp('3%') }}
                        >
                            <Text className="text-white" style={{ fontSize: hp('1.6%') }}>{invitedFriends.length > 99 ? '99+' : invitedFriends.length}</Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* show list with ongoing invites */}
            {bottomVisible && (
                <View className="h-[40%] border">
                    <FlatList
                        data={invitedFriends || []}
                        keyExtractor={(item) => item.friend.$id}
                        renderItem={({ item }) => (
                            <FriendComponent
                                item={item.friend}
                                titleStyles={{fontSize: hp('1.7%') > 15 ? 15 :  hp('1.7%')}}
                                iconStyles={{width: hp('4.5%'), height: hp('4.5%')}}
                                containerStyles={{width: '88%'}}
                                requestId={item.request.$id}
                                forInvite={false}
                                setIsLoading={setIsLoading}
                            />
                        )}
                        className="my-2"
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
        </View>
    )
}

export default RequestMenu