import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, ActivityIndicator } from 'react-native';
import { icons } from '../constants';
import { router } from 'expo-router';
import StatusCard from '../components/device/StatusCard';
import { useGlobalContext } from '../context/GlobalProvider';
import Container from '../components/Container';
import { usePlantsContext } from '../context/PlantsProvider';
import CustomButton from '../components/CustomButton';
import { updatePlant, subscribeToPlants } from '../lib/appwrite';
import { useMqttContext } from '../context/MqttProvider';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BlurView } from 'expo-blur';

const Device = () => {
  const { user } = useGlobalContext()
  const { activePlant, setActivePlant, setPlants, plants } = usePlantsContext()
  const { client, temperature, brightness, waterLevel,
    isEnabled, pump, pumpSwitch, lampSwitch, humidity } = useMqttContext();
  const [edit, setEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  //form for plantId and name of plant
  const [form, setForm] = useState({
    plantId: '',
    plantName: ''
  })

  //getting plantId from the activePlant
  const plantId = activePlant.plantId;

  //function to go back to home page
  const handleBack = () => {
    router.back()
  }

  //
  const handleUpdatePlant = async (id, name) => {
    try {
      setIsLoading(true)
      const response = await updatePlant(activePlant.$id, id, name)
    } catch (error) {
      console.log(error)
    }
    finally { setIsLoading(false) }
  }

  //handle updates in 'plants' collection
  const handlePlantUpdated = (response) => {
    const eventType = response.events;
    const updatedItem = response.payload
    if (eventType.some((item) => item.includes('delete'))) {
      handleBack()
      setActivePlant(null);
    }
    else if (eventType.some((item) => item.includes('update'))) {
      setActivePlant(updatedItem)
      setPlants((previous) => previous.map(
        (item) => item.$id === updatedItem.$id ? updatedItem : item
      ))
    }
  }

  //function to update plant information (plantId and name)
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

  //subscribe to 'plants' collection to see updates instantly
  useEffect(() => {
    const unsubscribePlants = subscribeToPlants(user.$id, handlePlantUpdated)

    return () => {
      unsubscribePlants();
      if (client) { client.disconnect() }
    }
  }, [])



  return (
    <Container
      colors={['#4ec09c', '#a8d981']}
      areaStyles={'items-center'}
    >
      {isLoading && (
        <BlurView
          className="w-full h-full items-center justify-center absolute z-50"
          intensity={70}
          tint='systemChromeMaterial'
        >
          <ActivityIndicator size={'large'} color={'green'} />
        </BlurView>
      )}
      <View
        className="w-full justify-center items-center flex-row mt-[2%]"
        style={{ height: hp('10%') }}
      >
        <View className="absolute left-[5%]">
          {/* button to go back to home page */}
          <CustomButton
            useAnimatedIcon={true}
            imageSource={icons.backAnimated}
            iVisible={true}
            width={hp('4%')}
            height={hp('4%')}
            textContainerStyles={'h-0 w-0'}
            containerStyles={''}
            handlePress={handleBack}
          />
        </View>

        {/* check if user is creator and user is editting the plant, then show text inputs for plantId and plant name */}
        {edit && (activePlant && activePlant.users[0].$id == user.$id) ? (
          <View style={{ marginLeft: (form.plantId != plantId || form.plantName != activePlant.name) ? '7%' : 0, width: '60%' }}>
            <TextInput
              value={form.plantName}
              placeholder={'Keep it simple'}
              className={'pl-[2%] bg-transparent font-pregular text-notFullWhite'}
              style={{ fontSize: hp('2.5%') }}
              onChangeText={(e) => setForm({ ...form, plantName: e })}
            />
            <TextInput
              value={form.plantId}
              placeholder={'Keep it simple'}
              className={'pl-[2%] w-[100%] bg-transparent font-plight text-notFullWhite items-center justify-center '}
              style={{ fontSize: hp('1.6%') }}
              onChangeText={(e) => setForm({ ...form, plantId: e })}
            />
          </View>

        ) : (
          // else show just text with plantId and plant name
          <View className="items-center justify-center w-[60%]">
            <Text className="text-notFullWhite font-pregular" style={{ fontSize: hp('2.5%') }}>{activePlant.name}</Text>
            <Text className="text-notFullWhite font-plight " style={{ fontSize: hp('1.6%') }}>{activePlant.plantId}</Text>
          </View>
        )}

        {/* show edit button if user is creator */}
        {activePlant && activePlant.users[0].$id == user.$id && (
          <View className="items-center justify-center ml-2 flex-row">
            <CustomButton
              useAnimatedIcon={true}
              iVisible={true}
              imageSource={edit ? icons.saveAnim : icons.editAnimated}
              width={hp('4%')}
              height={hp('4%')}
              textContainerStyles={'w-0 h-0'}
              handlePress={handleEdit}
            />
            {/* show save button if user changes plantId or plant name */}
            {edit && (form.plantId != plantId || form.plantName != activePlant.name) && (
              <View className="ml-2">
                <CustomButton
                  useAnimatedIcon={false}
                  imageSource={icons.close}
                  imageStyles={'w-8 h-8'}
                  bonusImageStyles={{ width: hp('4%'), height: hp('4%') }}
                  textContainerStyles={'w-0 h-0'}
                  handlePress={() => {
                    setForm({ plantId: plantId, plantName: activePlant.name })
                    setEdit(!edit)
                  }}
                />
              </View>
            )}
          </View>
        )}
      </View>
      <View className="h-[0.1rem] bg-black w-[80%]"></View>

      {/* show Status Card component for each needed value of plant's sensors */}
      <View className="items-center justify-center top-10 flex-col" style={{ gap: hp('1%') }}>
        <View className="flex-row items-center justify-center" style={{ gap: hp('1%') }}>
          {/* turn on/off lamp */}
          <StatusCard
            label="LAMP"
            value=""
            showSwitch={true}
            onSwitchChange={lampSwitch}
            colorSwitch={isEnabled}
            isEnabled={isEnabled}
            iconSource={icons.lightbulb}
            valueStyles={"h-0 w-0"}
            bonusIconStyles={{ width: hp('6%'), maxWidth: 60, maxHeight: 60, height: hp('6%'), marginBottom: hp('1%') }}
            bonusContainerStyles={{ width: wp('35%'), maxWidth: 170, height: hp('20%'), maxHeight: 200 }}
            valueContainerStyles={{ marginTop: hp('0.3%') }}
          />
          {/* show temperature */}
          <StatusCard
            label="TEMP"
            value={temperature + '°C'}
            showSwitch={false}
            iconSource={icons.temp}
            bonusIconStyles={{ width: hp('6%'), maxWidth: 60, maxHeight: 60, height: hp('6%'), marginBottom: hp('1%') }}
            bonusContainerStyles={{ width: wp('35%'), maxWidth: 170, height: hp('20%'), maxHeight: 200 }}
            valueContainerStyles={{ marginTop: hp('0.3%') }}
          />
        </View>
        <View className="flex-row items-center justify-center" style={{ gap: hp('1%') }}>
          {/* show humidity */}
          <StatusCard
            label="HUMIDITY"
            value={humidity + '%'}
            showSwitch={false}
            iconSource={icons.hmdty}
            bonusIconStyles={{ width: hp('6%'), maxWidth: 60, maxHeight: 60, height: hp('6%'), marginBottom: hp('1%') }}
            bonusContainerStyles={{ width: wp('35%'), maxWidth: 170, height: hp('20%'), maxHeight: 200 }}
            valueContainerStyles={{ marginTop: hp('0.3%') }}
          />
          {/* show brightness */}
          <StatusCard
            label="BRIGHTNESS"
            value={brightness + '%'}
            showSwitch={false}
            iconSource={icons.brghtns}
            bonusIconStyles={{ width: hp('6%'), maxWidth: 60, maxHeight: 60, height: hp('6%'), marginBottom: hp('1%') }}
            bonusContainerStyles={{ width: wp('35%'), maxWidth: 170, height: hp('20%'), maxHeight: 200 }}
            valueContainerStyles={{ marginTop: hp('0.3%') }}
          />
        </View>
        <View className="flex-row items-center justify-center" style={{ gap: hp('1%') }}>
          {/* turn on/off water pump */}
          <StatusCard
            label="PUMP"
            value=""
            showSwitch={true}
            onSwitchChange={pumpSwitch}
            colorSwitch={true}
            isEnabled={pump}
            iconSource={icons.motor}
            valueStyles={"h-0 w-0"}
            bonusIconStyles={{ width: hp('6%'), maxWidth: 60, maxHeight: 60, height: hp('6%'), marginBottom: hp('1%') }}
            bonusContainerStyles={{ width: wp('35%'), maxWidth: 170, height: hp('20%'), maxHeight: 200 }}
            valueContainerStyles={{ marginTop: hp('0.3%') }}
          />
          {/* show water */}
          <StatusCard
            label="WATER"
            value={waterLevel + 'ml'}
            showSwitch={false}
            iconSource={icons.wlevel}
            bonusIconStyles={{ width: hp('6%'), maxWidth: 60, maxHeight: 60, height: hp('6%'), marginBottom: hp('1%') }}
            bonusContainerStyles={{ width: wp('35%'), maxWidth: 170, height: hp('20%'), maxHeight: 200 }}
            valueContainerStyles={{ marginTop: hp('0.3%') }}
          />
        </View>

        {/*<View className="flex-row items-center justify-center">
          <StatusCard
            label="AUTO"
            value=""
            showSwitch={true}
            onSwitchChange={() => { }}
            isEnabled={isEnabled}
            otherStyles={`flex-row w-[303px] h-[75px]`}
            invert={true}
            labelStyles={`text-bleen`}
            valueStyles={"h-0 w-0"}
            bonusContainerStyles={{ width: wp('76%'), maxWidth: 367, height: hp('10%'), maxHeight: 200, }}
            valueContainerStyles={{ marginBottom: hp('1%'), paddingTop: hp('1%') }}
          />
        </View>*/}
      </View>
    </Container>
  )
}

export default Device