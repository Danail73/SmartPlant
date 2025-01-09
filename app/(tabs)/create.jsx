import { View, Text } from 'react-native'
import React, { useState } from 'react'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'

const Create = () => {
  const [form, setForm] = useState({
    plantId: '',
    title: '',
  })
  return (
    <View className="flex-1 items-center justify-center bg-gray-500">
      <View className="bg-notFullWhite rounded-lg h-[300px] p-3">
        <FormField
          title='plantId'
          placeholder={"Enter plantId"}
          textStyles={''}
          inputStyles={''}
        />
        <FormField
          title='name'
          placeholder={"Enter name"}
        />
        <CustomButton
          title='Create'
          containerStyles={'h-[40px] border border-black bg-gray-200 rounded-lg'}
          textStyles={''}
        />
      </View>
    </View>
  )
}

export default Create