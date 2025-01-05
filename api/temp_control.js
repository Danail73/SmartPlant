import axios from 'axios';
import {useState, useEffect} from 'react'

const baseUrl = 'http://192.168.10.118:3000';

const fetchTemperature = () => {
  const [isLoading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState('');

  const getTemp = async (req, res) => {
    try{
      setLoading(true);
      const response = await axios.get(baseUrl+'/getTemp');
      if(response.status === 200){
        const {value, state} = response.data.temperature;
        setTemperature(state);
      }
      else{
        console.log('Failed to fetch the temp')
      }
    }
    catch(error){
      console.log('Error', error);
    }
    finally{
      setLoading(false);
    }
    return temperature
  }

  useEffect(()=>{
    getTemp();
    console.log(temperature);
  }, [])

  return {temperature}
}

export default fetchTemperature;