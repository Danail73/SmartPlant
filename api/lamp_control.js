import axios from 'axios'
import { useState, useEffect } from 'react';

const baseUrl = 'http://192.168.3.20:3000';

const fetchLampInfo = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isloading, setLoading] = useState(false);
  const [isTurnedOn, setIsTurnedOn] = useState(false);

  const getLampInfo = async(req, res) => {
    try{
      await setLoading(true);
      const response = await axios.get(baseUrl+'/lamp');
      if(response.status === 200){
        const state = response.data.lamp.state;
        if(String(state).trim() === "OFF"){
          setIsEnabled(false);
          setIsTurnedOn(false);
        } else if (String(state).trim() === "ON"){
          setIsEnabled(true);
          setIsTurnedOn(true);
        } else {
          console.log(`Unexpected state value: "${state}"`);
        }
      }
      else{
        console.error('Failed to fetch the lamp info')
      }
    }
    catch(error){
      console.error('Error', error);
    }
    finally{
      setLoading(false);
    }

    return {isEnabled, isTurnedOn}
  }

  useEffect(()=>{
    getLampInfo();
  }, [])

  const refetch = async () => {
    const {isEnabled, isTurnedOn} = await getLampInfo();
    return {isEnabled, isTurnedOn};
  }

  return {refetch}
}

const turnLampOn = () => {
  const [isLoading, setLoading] = useState(false);
  const [isTurnedOn, setIsTurnedOn] = useState(false);

  const turnOn = async(req,res) => {
    try{
      setLoading(true);
      const response = await axios.get(baseUrl+'/lampOn');
      if(response.status === 200){
        setIsTurnedOn(true);
        return response;
      }
      else{
        console.error('Failed to turn lamp on')
      }
    }
    catch(error){
      console.error('Error', error);
    }
    finally{
      setLoading(false);
    }

    return isTurnedOn
  }

  const refetch = async () => {
    const result = await turnOn();
    return result;
  }

  return {refetch}
}

const turnLampOff = () => {
  const [isLoading, setLoading] = useState(false);
  const [isTurnedOn, setIsTurnedOn] = useState(false);

  const turnOff = async(req,res) => {
    try{
      setLoading(true);
      const response = await axios.get(baseUrl+'/lampOff');
      if(response.status === 200){
        setIsTurnedOn(false);
        return response;
      }
      else{
        console.error('Failed to turn lamp off')
      }
    }
    catch(error){
      console.error('Error', error);
    }
    finally{
      setLoading(false);
    }

    return isTurnedOn;
  }

  const refetch = async () => {
    const result = await turnOff();
    return result;
  }

  return {refetch}
}

export {turnLampOff, turnLampOn, fetchLampInfo};