import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import CustomButton from './CustomButton'
import FriendComponent from './FriendComponent'
import React, { useEffect, useState } from 'react'
import DeleteMenuComponent from './DeleteMenuComponent'
import { getAcceptedRequest, respondFriendRequest } from '../lib/appwrite'

const DeleteFriendsMenu = ({ friends, cancel, currentUser }) => {
    const [friendsToRemove, setFriendsToRemove] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const addItemToRemove = (item) => {
        const users = friendsToRemove;
        users.push(item)
        setFriendsToRemove(users)
    }
    const discardItemToRemove = (item) => {
        const users = friendsToRemove.filter((u) => u.friend.$id != item.friend.$id);
        setFriendsToRemove(users);
    }

    const handleRemoveFriends = async () => {
        setIsLoading(true)
        friendsToRemove.forEach(async (item) => {
            try {
                const response = await respondFriendRequest(item.request.$id, 'declined')
            } catch (error) {
                console.log(error)
            }
        })
        setIsLoading(false)
    }
    return (
        <View className="border-2 max-h-[70%] top-20 right-5 left-5 absolute bg-notFullWhite rounded-lg">
            {isLoading && (
                <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-25">
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}
            <View className="items-center justify-center">
                <View>
                    <Text className="mt-5 font-pmedium text-lg">Choose friends to remove</Text>
                </View>
                <View className="bg-black h-[1px] w-[90%] my-3"></View>
                {friends ? (
                    <FlatList
                        data={friends || []}
                        keyExtractor={(item) => item.friend.$id || item.id.toString()}
                        renderItem={({ item }) => (
                            <DeleteMenuComponent item={item} addItemToRemove={addItemToRemove} discardItemToRemove={discardItemToRemove} />
                        )}
                        className="my-2 max-h-[75%]"
                        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View className="items-center justify-center flex-col p-8 h-[300px]">
                        <Image
                            source={images.noResult}
                            className="w-[100px] h-[100px] mb-3"
                            resizeMode='contain'
                            style={{ tintColor: '#4d4752' }}
                        />
                        <Text className="text-[#4d4752] font-pregular text-lg">No friends found</Text>
                    </View>
                )}
                <View className="bg-black h-[1px] w-[90%] my-3"></View>
            </View>
            <View className="flex-row min-h-[10%] max-h-[35%] items-center justify-between px-12">
                <CustomButton
                    title='Cancel'
                    handlePress={() => cancel()}
                    containerStyles={'border rounded-lg w-[40%] h-[45%]'}
                    textStyles={'font-pmedium text-lg'}
                />
                <CustomButton
                    title='Remove'
                    handlePress={handleRemoveFriends}
                    containerStyles={'border rounded-lg w-[40%] h-[45%]'}
                    textStyles={'font-pmedium text-lg'}
                    disabled={(friendsToRemove && friendsToRemove.length>0) ? false : true}
                />
            </View>
        </View>
    )
}

export default DeleteFriendsMenu