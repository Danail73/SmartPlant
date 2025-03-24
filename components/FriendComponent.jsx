import { View, Text, StyleSheet, Image, Touchable, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '../constants';
import { respondFriendRequest, sendFriendRequest } from '../lib/appwrite';

const FriendComponent = ({ item, forInvite, fromUser, isPending, otherStyles, iconStyles, titleStyles, subtitleStyles, requestId }) => {

    const handleSendRequest = async () => {
        try {
            const response = await sendFriendRequest(fromUser.$id, item.$id)
        } catch (error) {
            console.log(error)
        }
    }

    const updateRequest = async (status) => {
        try {
            const response = await respondFriendRequest(requestId, status)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View className={`bg-notFullWhite rounded-xl max-w-[330px] p-3 border flex-row mb-1 items-center ${otherStyles}`}>
            <Image
                source={{ uri: item.avatar }}
                className={`w-14 h-14 rounded-full mr-2 ${iconStyles}`}
                resizeMode='contain'
            />
            <View>
                <Text className={`font-psemibold text-base mb-1 ${titleStyles}`}>{item.username}</Text>
                <Text className={`font-plight text-sm ${subtitleStyles}`}>{item.email}</Text>
            </View>
            {forInvite && (
                <View className="absolute right-3">
                    <TouchableOpacity
                        className="w-14 h-14 rounded-full"
                        onPress={handleSendRequest}
                    >
                        <LinearGradient
                            colors={['#6666ff', '#3333ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                flex: 1,
                                borderRadius: 35,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Image
                                source={icons.addFriend}
                                className="w-6 h-6"
                                resizeMode='contain'
                                style={{ tintColor: '#f2f9f1' }}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {isPending && (
                <View className="flex-row gap-3 absolute right-3 top-2">
                    <TouchableOpacity
                        onPress={async () => await updateRequest('accepted')}
                    >
                        <View className="border w-[110%] items-center justify-center bg-green-300">
                            <Text className="font-pregular">Accept</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => await updateRequest('declined')}
                    >
                        <View className="border w-[110%] items-center justify-center bg-red-400">
                            <Text className="font-pregular">Decline</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
};


export default FriendComponent