import React, { useState, useEffect } from 'react';
import { FlatList, Image, Text, View, Button, TouchableOpacity, TextInput } from 'react-native';
import { icons } from '../constants';
import { router } from 'expo-router';
import StatusCard from '../components/StatusCard';
import { useGlobalContext } from '../context/GlobalProvider';
import Container from '../components/Container';
import { usePlantsContext } from '../context/PlantsProvider';
import CustomButton from '../components/CustomButton';
import { updatePlant, subscribeToPlants } from '../lib/appwrite';
import useMqttClient from '../api/mqtt/mqtt';



const Device = () => {
  const { user } = useGlobalContext()
  const { activePlant, setActivePlant, setPlants, plants } = usePlantsContext()
  const { client, temperature, brightness, waterLevel,
     isEnabled, pump, pumpSwitch, lampSwitch, humidity} = useMqttClient();
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({
    plantId: '',
    plantName: ''
  })

  const plantId = activePlant.plantId;


  const handleBack = () => {
    router.back()
  }

  const handleUpdatePlant = async (id, name) => {
    try {
      const response = await updatePlant(activePlant.$id, id, name)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlantUpdated = (response) => {
    const eventType = response.events;
    const updatedItem = response.payload
    if (eventType.some((item) => item.includes('delete'))) {
      handleBack()
    }
    else if (eventType.some((item) => item.includes('update'))) {
      setActivePlant(updatedItem)
      setPlants((previous) => previous.map(
        (item) => item.$id === updatedItem.$id ? updatedItem : item
      ))
    }
  }

  const handleEdit = () => {
    if (edit) {
      if (form.plantId != plantId || form.plantName != activePlant.name) {
        handleUpdatePlant(form.plantId, form.plantName)
      }
    }
    else {
      setForm({ plantId: plantId, plantName: activePlant.name })
    }
    const timeout = setTimeout(() => {
      setEdit(!edit)
    }, 600)
    return () => clearTimeout(timeout)
  }


  useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => {
      unsubscribePlants();
      if(client) {client.disconnect()}
    }
  }, [])

  

  return (
    <Container
      colors={['#4ec09c', '#a8d981']}
      areaStyles={'items-center'}
    >
      <View
        className="w-full h-20 justify-center items-center flex-row mt-[2%]"
      >
        <View className="absolute left-[5%]">
          <CustomButton
            useAnimatedIcon={true}
            imageSource={icons.backAnimated}
            iVisible={true}
            width={35}
            height={35}
            textContainerStyles={'h-0 w-0'}
            containerStyles={''}
            handlePress={handleBack}
          />
        </View>

        {!edit ? (
          <View className="items-center justify-center w-[60%]">
            <Text className="text-notFullWhite font-pregular text-2xl">{activePlant.name}</Text>
            <Text className="text-notFullWhite font-plight text-sm">{activePlant.plantId}</Text>
          </View>
        ) : (
          <View style={{ marginLeft: (form.plantId != plantId || form.plantName != activePlant.name) ? '7%' : 0, width: '60%' }}>
            <TextInput
              value={form.plantName}
              placeholder={'Keep it simple'}
              className={'pl-[2%] bg-transparent font-pregular text-notFullWhite text-2xl'}
              onChangeText={(e) => setForm({ ...form, plantName: e })}
            />
            <TextInput
              value={form.plantId}
              placeholder={'Keep it simple'}
              className={'pl-[2%] w-[100%] bg-transparent font-plight text-notFullWhite text-sm items-center justify-center mt-[-10%]'}
              onChangeText={(e) => setForm({ ...form, plantId: e })}
            />
          </View>
        )}
        <View className="items-center justify-center ml-2 flex-row">
          <CustomButton
            useAnimatedIcon={true}
            iVisible={true}
            imageSource={edit ? icons.saveAnim : icons.editAnimated}
            width={edit ? 32 : 40}
            height={edit ? 32 : 40}
            textContainerStyles={'w-0 h-0'}
            handlePress={handleEdit}
          //bonusImageStyles={{tintColor: 'white'}}
          />
          {edit && (form.plantId != plantId || form.plantName != activePlant.name) && (
            <View className="ml-2">
              <CustomButton
                useAnimatedIcon={false}
                imageSource={icons.close}
                imageStyles={'w-8 h-8'}
                textContainerStyles={'w-0 h-0'}
                handlePress={() => {
                  setForm({ plantId: plantId, plantName: activePlant.name })
                  setEdit(!edit)
                }}
              />
            </View>
          )}
        </View>
      </View>
      <View className="h-[0.1rem] bg-black w-[80%]"></View>
      <View className="items-center justify-center top-10">
        <View className="flex-row items-center justify-center">
          <StatusCard
            label="LAMP"
            value=""
            showSwitch={true}
            onSwitchChange={lampSwitch}
            colorSwitch={isEnabled}
            isEnabled={isEnabled}
            iconSource={icons.lightbulb}
          />
          <StatusCard
            label="TEMP"
            value={temperature}
            showSwitch={false}
            otherStyles={'ml-5'}
            iconSource={icons.temp}
          />
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <StatusCard
            label="HUMIDITY"
            value={humidity}
            showSwitch={false}
            iconSource={icons.hmdty}
          />
          <StatusCard
            label="BRIGHTNESS"
            value={brightness}
            showSwitch={false}
            otherStyles={'ml-5'}
            iconSource={icons.brghtns}
          />
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <StatusCard
            label="PUMP"
            value=""
            showSwitch={true}
            onSwitchChange={pumpSwitch}
            colorSwitch={true}
            isEnabled={pump}
            iconSource={icons.motor}
          />
          <StatusCard
            label="WATER LEVEL"
            value={waterLevel}
            showSwitch={false}
            otherStyles={'ml-5'}
            iconSource={icons.wlevel}
          />
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <StatusCard
            label="AUTO"
            value=""
            showSwitch={true}
            onSwitchChange={() => { }}
            isEnabled={isEnabled}
            otherStyles={`flex-row w-[303px] h-[75px]`}
            invert={true}
            labelStyles={`text-bleen`}
          />
        </View>
      </View>
    </Container>
  )
}

export default Device