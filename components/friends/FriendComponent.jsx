import { View, Text, StyleSheet, Image, Touchable, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '../../constants';
import { respondFriendRequest, sendFriendRequest } from '../../lib/appwrite';

const FriendComponent = ({ item, forInvite, fromUser, isPending, otherStyles, iconStyles, titleStyles, subtitleStyles, requestId, containerStyles, setIsLoading }) => {

    //function to send request to the user
    const handleSendRequest = async () => {
        try {
            setIsLoading(true)
            const response = await sendFriendRequest(fromUser.$id, item.$id)
        } catch (error) {
            console.log(error)
        }
        finally { setIsLoading(false) }
    }

    //function to accept/decline request
    const updateRequest = async (status) => {
        try {
            setIsLoading(true)
            const response = await respondFriendRequest(requestId, status)
        } catch (error) {
            console.log(error)
        }
        finally { setIsLoading(false) }
    }

    return (
        <View className={`bg-notFullWhite rounded-xl max-w-[450px] p-3 border flex-row mb-1 items-center`} style={containerStyles}>
            <Image
                source={{ uri: item.avatar }}
                className={`w-14 h-14 rounded-full mr-2`}
                resizeMode='contain'
                style={iconStyles}
            />
            <View>
                <Text className={`font-psemibold text-base mb-1`} style={titleStyles}>{item.username}</Text>
                <Text className={`font-plight text-sm`} style={subtitleStyles}>{item.email}</Text>
            </View>

            {/* show button to invite if the component is in other users list in the friends page */}
            {forInvite && (
                <View className="absolute right-3">
                    <TouchableOpacity
                        className="w-14 h-14 rounded-full"
                        onPress={handleSendRequest}
                        testID='invite-test'
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

            {/* show accept/decline buttons if incoming invite */}
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