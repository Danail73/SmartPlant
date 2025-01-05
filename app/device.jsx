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



const Device = () => {
  const { uset, setUser, setIsLoggedIn } = useGlobalContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [isTurnedOn, setIsTurnedOn] = useState(false);
  const [lightInfo, setLightInfo] = useState('');
  const [waterLevel, setWaterLevel] = useState('');
  const [motorOn, setMotorOn] = useState(false);

  const { plantId } = useLocalSearchParams();
  const baseUrl = 'http://192.168.10.122:3000' + `/${plantId}`;

  //console.log(baseUrl)

  const logout = async () => {
    await signOut()
    setUser(null)
    setIsLoggedIn(false)

    router.replace('/login')
  }

  const toggleSwitch = async () => {
    try {
      setIsEnabled(!isEnabled);
      if (!isEnabled) {
        if (!isTurnedOn) {
          const response = await turnLampOn(setLoading, setIsTurnedOn);
          setIsTurnedOn(true);
        }
      } else {
        if (isTurnedOn) {
          const response = await turnLampOff(setLoading, setIsTurnedOn);
          setIsTurnedOn(false);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchTemperature = async (req, res) => {
    try {
      setLoading(true);
      const response = await axios.get(baseUrl + '/getTemp');
      if (response.status === 200) {
        const { value, state } = response.data.temperature;
        setTemperature(state);
      }
      else {
        console.error('Failed to fetch the temp')
      }
    }
    catch (error) {
      throw error;
    }
    finally {
      setLoading(false);
    }
  }

  const fetchLampInfo = async (req, res) => {
    try {
      await setLoading(true);
      const response = await axios.get(baseUrl + '/lamp');
      if (response.status === 200) {
        const state = response.data.lamp.state;
        if (String(state).trim() === "OFF") {
          setIsEnabled(false);
          setIsTurnedOn(false);
        } else if (String(state).trim() === "ON") {
          setIsEnabled(true);
          setIsTurnedOn(true);
        } else {
          console.log(`Unexpected state value: "${state}"`);
        }
      }
      else {
        console.error('Failed to fetch the lamp info')
      }
    }
    catch (error) {
      throw error;
    }
    finally {
      setLoading(false);
    }
  }

  const turnLampOn = async (req, res) => {
    try {
      setLoading(true);
      const response = await axios.get(baseUrl + '/lampOn');
      if (response.status === 200) {
        setIsTurnedOn(true);
        return response;
      }
      else {
        console.error('Failed to turn lamp on')
      }
    }
    catch (error) {
      throw error;
    }
    finally {
      setLoading(false);
    }
  }

  const turnLampOff = async (req, res) => {
    try {
      setLoading(true);
      const response = await axios.get(baseUrl + '/lampOff');
      if (response.status === 200) {
        setIsTurnedOn(false);
        return response;
      }
      else {
        console.error('Failed to turn lamp off')
      }
    }
    catch (error) {
      throw error;
    }
    finally {
      setLoading(false);
    }
  }

  const fetchLightInfo = async (req, res) => {
    try {
      setLoading(true);
      const response = await axios.get(baseUrl + '/light');
      if (response.status === 200) {
        const { value, state } = response.data.light;
        setLightInfo(state);
      }
      else {
        console.error('Failed to fetch light info')
      }
    }
    catch (error) {
      throw error;
    }
    finally {
      setLoading(false);
    }
  }

  const fetchWaterLevel = async (req, res) => {
    try {
      setLoading(true);
      const response = await axios.get(baseUrl + '/waterLevel');
      if (response.status === 200) {
        const { value, state } = response.data.water;
        setWaterLevel(state);
      }
      else {
        console.error('Failed to fetch water level')
      }
    }
    catch (error) {
      throw error;
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchTemperature();
        await fetchLightInfo();
        await fetchWaterLevel();
      } catch (error) {
        //console.log(error)
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      try {
        fetchLampInfo();
        setIsEnabled(isTurnedOn);
      } catch (error) {

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