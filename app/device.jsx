import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Image, Text, View, Button, TouchableOpacity, TextInput } from 'react-native';
import { icons } from '../constants';
import { router, useLocalSearchParams } from 'expo-router';
import StatusCard from '../components/StatusCard';
import { useGlobalContext } from '../context/GlobalProvider';
import BackButton from '../components/BackButton';
import Container from '../components/Container';
import { fetchTemp, fetchLampState, fetchLightInfo, fetchWaterLevel, turnLampOff, turnLampOn } from '../api/plantControl';
import { usePlantsContext } from '../context/PlantsProvider';
import CustomButton from '../components/CustomButton';
import FormField from '../components/FormField';
import { updatePlant, subscribeToPlants } from '../lib/appwrite';


const Device = () => {
  const { user } = useGlobalContext()
  const { activePlant, setActivePlant, setPlants, plants } = usePlantsContext()
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [isTurnedOn, setIsTurnedOn] = useState(false);
  const [lightInfo, setLightInfo] = useState('');
  const [waterLevel, setWaterLevel] = useState('');
  const [motorOn, setMotorOn] = useState(false);
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

  const toggleSwitch = async () => {
    try {
      if (!isEnabled) {
        await handleTurnLampOn();
      } else {
        await handleTurnLampOff();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleFetchTemperature = async (req, res) => {
    try {
      const response = await fetchTemp(plantId)
      setTemperature(response);
    }
    catch (error) {
      throw error;
    }
  }

  const handleFetchLampInfo = async (req, res) => {
    try {
      const response = await fetchLampState(plantId);
      setIsTurnedOn(response);
    }
    catch (error) {
      throw error;
    }
  }

  const handleTurnLampOn = async (req, res) => {
    try {
      const response = await turnLampOn(plantId);
      if (response) {
        setIsEnabled(true);
        setIsTurnedOn(true);
      }
    }
    catch (error) {
      throw error;
    }
  }

  const handleTurnLampOff = async (req, res) => {
    try {
      const response = await turnLampOff(plantId);
      if (response) {
        setIsEnabled(false);
        setIsTurnedOn(false);
      }
    }
    catch (error) {
      throw error;
    }
  }

  const handleFetchLightInfo = async (req, res) => {
    try {
      const response = await fetchLightInfo(plantId)
      setLightInfo(response);
    }
    catch (error) {
      throw error;
    }
  }

  const handleFetchWaterLevel = async (req, res) => {
    try {
      const response = await fetchWaterLevel(plantId)
      setWaterLevel(response);
    }
    catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true);
      try {
        await handleFetchTemperature();
        await handleFetchLightInfo();
        await handleFetchWaterLevel();
      } catch (error) {
        //console.error(error)
      } finally {
        setLoading(false);
      }
    }, 5000);



    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true);
      try {
        await handleFetchLampInfo();
        setIsEnabled(isTurnedOn);
      } catch (error) {
        //console.error(error)
      } finally {
        setLoading(false);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled, isTurnedOn]);

  useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => unsubscribePlants()
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
            onSwitchChange={toggleSwitch}
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
            value="56%"
            showSwitch={false}
            iconSource={icons.hmdty}
          />
          <StatusCard
            label="BRIGHTNESS"
            value={lightInfo}
            showSwitch={false}
            otherStyles={'ml-5'}
            iconSource={icons.brghtns}
          />
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <StatusCard
            label="MOTOR"
            value=""
            showSwitch={true}
            onSwitchChange={() => { setMotorOn(!motorOn) }}
            colorSwitch={true}
            isEnabled={motorOn}
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
            onSwitchChange={() => { setIsEnabled(!isEnabled) }}
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