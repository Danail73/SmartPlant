import { View, Text, StyleSheet, Image, Touchable, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '../constants';
import { sendFriendRequest } from '../lib/appwrite';

const FriendComponent = ({ item, forInvite, fromUser }) => {
    
    const handleSendRequest = async () => {
        try {
            const response = await sendFriendRequest(fromUser.$id, item.$id)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={styles.shadowBox}>
            <View className="bg-notFullWhite rounded-xl w-[320px] p-3 border flex-row my-[0.5] items-center">
                <Image
                    source={{ uri: item.avatar }}
                    className="w-14 h-14 rounded-full mr-2"
                    resizeMode='contain'
                />
                <View>
                    <Text className="font-psemibold text-base mb-1">{item.username}</Text>
                    <Text className="font-plight text-sm">{item.email}</Text>
                </View>
                {forInvite && (
                    <View className="absolute right-3">
                        <TouchableOpacity
                            className="w-14 h-14 rounded-full"
                            onPress={async () => await handleSendRequest()}
                        >
                            <LinearGradient
                                colors={['#6666ff', '#3333ff']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    flex:1,
                                    borderRadius:35,
                                    alignItems:'center',
                                    justifyContent:'center'
                                }}
                            >
                                <Image
                                    source={icons.addFriend}
                                    className="w-6 h-6"
                                    resizeMode='contain'
                                    style={{tintColor:'#f2f9f1'}}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    shadowBox: {
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 2, height: 5 }, // Shadow position offset
        shadowOpacity: 0.25, // Shadow opacity
        shadowRadius: 10, // Shadow blur (adjusted for a softer shadow)
        elevation: 5, // Elevation for Android shadow
    },
});

export default FriendComponent