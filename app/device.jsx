import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Image, Text, View, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../constants';
import { TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import SwitchButton from '../components/SwitchButton'
import StatusCard from '../components/StatusCard';
import { signOut } from '../lib/appwrite';
import { useGlobalContext } from '../context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from '../components/BackButton';
import Container from '../components/Container';
import { fetchTemp, fetchLampState, fetchLightInfo, fetchWaterLevel, turnLampOff, turnLampOn } from '../api/plantControl';



const Device = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [isTurnedOn, setIsTurnedOn] = useState(false);
  const [lightInfo, setLightInfo] = useState('');
  const [waterLevel, setWaterLevel] = useState('');
  const [motorOn, setMotorOn] = useState(false);

  const { plantId } = useLocalSearchParams();

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      setIsLoggedIn(false)

      router.replace('/login')
    } catch (error) { }
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



  return (
    <Container
      colors={['#4ec09c', '#a8d981']}
    >
      <View
        className="w-full h-20 justify-center items-center flex-row pt-10"
      >
        <BackButton
          positionStyles={'absolute left-7 pt-10'}
        />

        <Text className="text-notFullWhite font-bold text-2xl">SMART PLANT</Text>
        <TouchableOpacity
          className="absolute right-7 pt-10"
          onPress={logout}
        >
          <Image
            source={icons.logout}
            className="w-8 h-8"
            style={{ tintColor: '#f2f9f1' }}
            resizeMethod='contain'
          />
        </TouchableOpacity>
      </View>
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