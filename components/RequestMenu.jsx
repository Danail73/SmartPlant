import { View, Text, Image, TouchableOpacity, Animated, FlatList } from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { icons } from '../constants'
import { subscribeToFriendRequests, subscribeToUsers } from '../lib/appwrite'
import { useGlobalContext } from '../context/GlobalProvider'
import FriendComponent from './FriendComponent'
import { t } from '../translations/i18n'

const RequestMenu = ({ onPress, requestFriends, invitedFriends}) => {
    const { user } = useGlobalContext();
    const [upperVisible, setUpperVisible] = useState(false)
    const [bottomVisible, setBottomVisible] = useState(false)
    const rotationUpper = useRef(new Animated.Value(0)).current;
    const rotationBottom = useRef(new Animated.Value(0)).current;

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

    const rotateInterpolateUpper = rotationUpper.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    const rotateInterpolateBottom = rotationBottom.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    

    return (
        <View className="absolute w-[70%]  bg-notFullWhite right-0 top-12 bottom-[110px] rounded-l-lg border">
            <TouchableOpacity
                onPress={toggleUpper}
            >
                <Animated.View

                    className="w-[100%] border flex-row items-center rounded-tl-md"
                >
                    <Animated.Image
                        style={{ transform: [{ rotate: rotateInterpolateUpper }] }}
                        source={icons.leftArrow}
                        className="w-5 h-5 m-2"
                    />
                    <Text className="font-pmedium">{t('Incoming Requests')}</Text>
                    {requestFriends.length > 0 && (
                        <View className="rounded-full border w-7 h-7 items-center justify-center bg-red-600 ml-1">
                            <Text className="text-white text-sm">{requestFriends.length > 99 ? '99+' : requestFriends.length}</Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {upperVisible && (
                <View className="h-[40%] border">
                    <FlatList
                        data={requestFriends || []}
                        keyExtractor={(item) => item.friend.$id}
                        renderItem={({ item }) => (
                            <FriendComponent
                                item={item.friend}
                                titleStyles={'text-sm mb-[0.3]'}
                                iconStyles={'w-9 h-9'}
                                otherStyles={'w-[99%]'}
                                requestId={item.request.$id}
                                isPending={true}
                                forInvite={false}
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
                    className="w-[100%] border flex-row items-center"
                >
                    <Animated.Image
                        style={{ transform: [{ rotate: rotateInterpolateBottom }] }}
                        source={icons.leftArrow}
                        className="w-5 h-5 m-2"
                    />
                    <Text className="font-pmedium">{t('Pending Invites')}</Text>
                    {invitedFriends.length > 0 && (
                        <View className="rounded-full border w-7 h-7 items-center justify-center bg-gray-500 ml-1">
                            <Text className="text-white text-sm">{invitedFriends.length > 99 ? '99+' : invitedFriends.length}</Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>
            {bottomVisible && (
                <View className="h-[40%] border">
                    <FlatList
                        data={invitedFriends || []}
                        keyExtractor={(item) => item.friend.$id}
                        renderItem={({ item }) => (
                            <FriendComponent
                                item={item.friend}
                                titleStyles={'text-sm mb-[0.3]'}
                                iconStyles={'w-9 h-9'}
                                otherStyles={'w-[99%]'}
                                requestId={item.request.$id}
                                forInvite={false}
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