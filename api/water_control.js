import axios from 'axios';
import {useState, useEffect} from 'react';

const baseUrl = 'http://192.168.3.20:3000';

const fetchWaterLevel = () => {
    const [isLoading, setLoading] = useState(false);
    const [waterLevel, setWaterLevel] = useState('');

    const getWaterLevel = async(req, res) => {
        try{
          setLoading(true);
          const response = await axios.get(baseUrl+'/waterLevel');
          if(response.status === 200){
            const {value, state} = response.data.water;
            setWaterLevel(state);
            console.log(waterLevel);
          }
          else{
            console.error('Failed to fetch water level')
          }
        }
        catch(error){
          console.error('Error', error);
        }
        finally{
          setLoading(false);
        }
        return waterLevel;
    }

    useEffect(()=>{
        getWaterLevel();
    }, [])

    const refetch = async () => {
        const wL = await getWaterLevel();
        return wL;
    }

    return {waterLevel, refetch}
}

export default fetchWaterLevel;