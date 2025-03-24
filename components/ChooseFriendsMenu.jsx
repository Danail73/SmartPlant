import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import CustomButton from './CustomButton'
import FriendComponent from './FriendComponent'
import React, { useEffect, useState } from 'react'
import ChooseMenuComponent from './ChooseMenuComponent'
import { getAcceptedRequest, respondFriendRequest } from '../lib/appwrite'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { images } from '../constants'

const ChooseFriendsMenu = ({ friends, cancel, currentUser, title, buttonTitle, fn, withRequest }) => {
    const [listFriends, setListFriends] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const width = wp('100%');
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
        <View
            className="border-2 bg-notFullWhite rounded-lg"
            style={{
                maxWidth: 600, minHeight: hp('20%'), maxHeight: hp('70%'), position: 'absolute', top: hp('10%'), 
                right: (width>600) ? (width-600)/2 : wp('5%'), left: (width>600) ? (width-600)/2 : wp('5%')}}
        >
            {isLoading && (
                <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-25">
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}
            <View className="items-center justify-center">
                <View>
                    <Text className="mt-5 font-pmedium" style={{fontSize: hp('1.8%')}}>{title}</Text>
                </View>
                <View className="bg-black h-[0.1rem] w-[90%] my-3"></View>
                {friends && friends.length>0 ? (
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
                    <View className="items-center justify-center flex-col w-[80%]" style={{height: hp('20%')}}>
                        <Image
                            source={images.noResult}
                            className="mb-3"
                            resizeMode='contain'
                            style={{ tintColor: '#4d4752', width: hp('10%'), height: hp('10%') }}
                        />
                        <Text className="text-[#4d4752] font-pregular text-lg">No friends found</Text>
                    </View>
                )}
                <View className="bg-black h-[0.1rem] w-[90%] my-3 mb-[70px]"></View>
            </View>
            <View className="flex-row h-[70px] items-center justify-between px-[14%] absolute bottom-0 w-full">
                <CustomButton
                    title='Cancel'
                    handlePress={() => cancel()}
                    containerStyles={'border rounded-lg w-[40%] h-[70%] max-w-[130px]'}
                    textStyles={'font-pmedium text-lg'}
                />
                <CustomButton
                    title={buttonTitle}
                    handlePress={handlePress}
                    containerStyles={'border rounded-lg w-[40%] h-[70%] max-w-[130px]'}
                    textStyles={'font-pmedium text-lg'}
                //disabled={listFriends.length>0 ? false : true}
                />
            </View>
        </View>
    )
}

export default ChooseFriendsMenu