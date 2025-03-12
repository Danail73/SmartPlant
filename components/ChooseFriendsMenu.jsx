import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import CustomButton from './CustomButton'
import FriendComponent from './FriendComponent'
import React, { useEffect, useState } from 'react'
import ChooseMenuComponent from './ChooseMenuComponent'
import { getAcceptedRequest, respondFriendRequest } from '../lib/appwrite'

const ChooseFriendsMenu = ({ friends, cancel, currentUser, title, buttonTitle, fn, withRequest }) => {
    const [listFriends, setListFriends] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const addItem = (item) => {
        const users = [...listFriends];
        users.push(item)
        setListFriends(users)
    }
    const discardItem = (item) => {
        if (withRequest) {
            const users = listFriends.filter((u) => u.friend.$id != item.friend.$id);
            setListFriends(users);
        } else {
            const users = listFriends.filter((u) => u.$id != item.$id)
            setListFriends(users);
        }
    }

    const handlePress = async () => {
        setIsLoading(true)
        fn(listFriends)
        setIsLoading(false)
    }
    return (
        <View className="border-2 min-h-[20%] max-h-[70%] top-20 right-5 left-5 absolute bg-notFullWhite rounded-lg">
            {isLoading && (
                <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-25">
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}
            <View className="items-center justify-center">
                <View>
                    <Text className="mt-5 font-pmedium text-lg">{title}</Text>
                </View>
                <View className="bg-black h-[1px] w-[90%] my-3"></View>
                {friends ? (
                    <FlatList
                        data={friends || []}
                        keyExtractor={(item) => withRequest ? item.friend.$id : item.$id}
                        renderItem={({ item }) => (
                            <ChooseMenuComponent item={item} addItem={addItem} discardItem={discardItem} withRequest={withRequest} />
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
            <View className="flex-row min-h-[70px] h-[28%] max-h-[70px] items-center justify-between px-12">
                <CustomButton
                    title='Cancel'
                    handlePress={() => cancel()}
                    containerStyles={'border rounded-lg w-[40%] h-[70%]'}
                    textStyles={'font-pmedium text-lg'}
                />
                <CustomButton
                    title={buttonTitle}
                    handlePress={handlePress}
                    containerStyles={'border rounded-lg w-[40%] h-[70%]'}
                    textStyles={'font-pmedium text-lg'}
                //disabled={listFriends.length>0 ? false : true}
                />
            </View>
        </View>
    )
}

export default ChooseFriendsMenu