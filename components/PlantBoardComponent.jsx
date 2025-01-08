import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { icons, images } from '../constants'
import { StyleSheet } from 'react-native'
import plantImages from '../constants/plantImages'
import PlantBoardMenu from './PlantBoardMenu'
import { PaperProvider } from 'react-native-paper'

const PlantBoardComponent = ({ title, plantId }) => {
    const plantImagesArray = [plantImages.plant1, plantImages.plant2, plantImages.plant3]
    const [image, setImage] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

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
            className={`flex-row items-center justify-start w-[250px] h-[105px] bg-notFullWhite rounded-2xl my-2 shadow-sm shadow-gray-500 mx-2`}
            style={styles.androidShadow}
        >
            <View className="px-2">
                <Image
                    source={image}
                    className="w-20 h-20"
                    resizeMode='contain'
                />
            </View>
            <View
                className="justify-center flex-col"
            >
                <Text className="text-gray-700 font-psemibold text-sm">
                    {title}
                </Text>

                <View className="flex-row items-start mt-2">
                    <Image
                        source={icons.clock}
                        className="w-5 h-5"
                        style={{ tintColor: 'gray' }}
                    />
                    <Text className="text-gray-700 font-psemibold text-sm mx-2">23-12-2025</Text>
                </View>

                <View className="flex-row items-start mt-2">
                    <Image
                        source={icons.drop}
                        className="w-5 h-5"
                        style={{ tintColor: 'gray' }}
                    />
                    <Text className="text-gray-700 font-psemibold text-sm mx-2">86 ml</Text>
                </View>
            </View>

            {/*onPress={() => {
                    router.push(`/device?plantId=${plantId}`);
                }}*/}

            <PlantBoardMenu
                buttonStyles={'absolute right-1 justify-center'}
                colors={['#000']}
                plantId={plantId}
            />
        </View>
    )
}

export default PlantBoardComponent

const styles = StyleSheet.create({
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