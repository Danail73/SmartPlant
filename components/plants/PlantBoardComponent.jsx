import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { icons } from '../../constants'
import { StyleSheet } from 'react-native'
import plantImages from '../../constants/plantImages'
import PlantBoardMenu from './PlantBoardMenu'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PlantBoardComponent = ({ item, isReceiving, addCallback, removeCallback, isActive }) => {
    const plantImagesArray = [plantImages.plant1, plantImages.plant2, plantImages.plant3]
    const [image, setImage] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    //function to get random image of a plant for the component
    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * plantImagesArray.length);
        return plantImagesArray[randomIndex];
    };

    useEffect(() => {
        if (!image) {
            setImage(getRandomImage());
        }
    }, [image])

    return (
        <View
            className={`flex-row items-center justify-start my-2 bg-notFullWhite rounded-2xl shadow-sm shadow-gray-500 overflow-visible`}
            style={[styles.androidShadow, { width: hp('27%'), height: hp('13%'), marginHorizontal: wp('1.5%') }]}
        >
            {/* show plant image */}
            <View className="px-2">
                <Image
                    source={image}
                    style={{ width: wp('13%'), height: wp('13%') }}
                    resizeMode='contain'
                />
            </View>
            <View
                className="justify-center flex-col"
            >
                {/* show plant name */}
                <Text className="text-gray-700 font-psemibold" style={{ fontSize: hp('1.6%') }}>
                    {item?.name}
                </Text>

                {/* show date of last update */}
                <View className="flex-row items-start" style={{ marginTop: hp('0.6%') }}>
                    <Image
                        source={icons.clock}
                        style={{ tintColor: 'gray', width: hp('2%'), height: hp('2%') }}
                    />
                    <Text className="text-gray-700 font-psemibold mx-2" style={{ fontSize: hp('1.5%') }}>
                        {item?.time[item?.time.length - 1]?.slice(0,10)}
                    </Text>
                </View>

                {/* show remaining water */}
                <View className="flex-row items-start" style={{ marginTop: hp('0.6%') }}>
                    <Image
                        source={icons.drop}
                        style={{ tintColor: 'gray', width: hp('2%'), height: hp('2%') }}
                    />
                    <Text className="text-gray-700 font-psemibold mx-2" style={{ fontSize: hp('1.5%') }}>
                        {item?.water[item?.water.length - 1]}
                    </Text>
                </View>

                {/* show if user is connected to the MQTT broker */}
                <View>
                    <Text style={{ fontSize: hp('1.5%'), marginTop: hp('0.6%') }}>{(isReceiving && isActive) ? "Connected" : "Disconnected"}</Text>
                </View>
            </View>

            {/* show menu with options for edit and delete */}
            <PlantBoardMenu
                item={item}
                addCallback={addCallback}
                removeCallback={removeCallback}
                menuStyle={{ width: hp('3.6%'), height: hp('3.6%') }} />
        </View>
    )
}

export default PlantBoardComponent

const styles = StyleSheet.create({
    //styles for shadow on different OS
    iosShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    androidShadow: {
        elevation: 5,
    },
});