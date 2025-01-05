import { View, Text } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native'
import PlantBoardComponent from './PlantBoardComponent'

const Plants = ({plants}) => {
  return (
    <FlatList
        data={plants}
        keyExtractor={(item) => item.$id}
        renderItem={({item}) => (
            <PlantBoardComponent
              title={item.name}
              
            />
        )}  
    />
  )
}

export default Plants