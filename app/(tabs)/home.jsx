import { FlatList, SafeAreaView, StyleSheet, Text, View, Image} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { getAllPlants } from '../../lib/appwrite'
import useAppWrite from '../../lib/useAppWrite'
import PlantBoardComponent from '../../components/PlantBoardComponent'
import { images } from '../../constants'
import Container from '../../components/Container'


const Home = () => {
  const { data: plants, refetch } = useAppWrite(getAllPlants);
  const [refreshing, setRefreshing] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  

  const onRefreshing = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const viewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item);
    }
  }, []);

  const viewConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshing();
      //console.log(activeItem)
    }, 1000);

    return () => clearInterval(interval);
  }, [activeItem]);

  return (
    <Container 
      colors={['#4ec09c', '#a8d981']}
      statusBarStyle={'light'}
    >
      <View className="px-10">
          <View className="h-20 items-center justify-between flex-row pl-4 pt-4">
            <Text className="text-notFullWhite font-pmedium text-3xl">Home</Text>
            <Text className="text-notFullWhite font-pmedium text-3xl">25 °C</Text>
          </View>

          <View className="flex-row items-center my-3">
            <Image
              source={images.good}
              className="w-[170px] h-[170px]"
              resizeMode='contain'
            />
            <View className="items-center justify-center pl-2">
              <Text className="font-pmedium text-notFullWhite text-xl">Everything{'\n'}good here!</Text>
            </View>
          </View>

          <View className="">
            <Text className="text-notFullWhite font-pmedium text-lg pl-4">Daily Plants</Text>
            <FlatList
              data={plants || []}
              keyExtractor={(item) => item.$id || item.id.toString()}
              renderItem={({ item }) => (
                <PlantBoardComponent title={item.name} plantId={item.id} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={viewableItemsChanged}
              viewabilityConfig={viewConfig}
            />
          </View>
        </View>
    </Container>
  );
};

export default Home;
