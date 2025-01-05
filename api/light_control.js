import axios from 'axios';
import {useState, useEffect} from 'react';

const baseUrl = 'http://192.168.3.20:3000';

const fetchLightInfo = () => {
    const [isLoading, setLoading] = useState(false);
    const [lightInfo, setLightInfo] = useState('');

    const getLightInfo = async(req, res) => {
        try{
          setLoading(true);
          const response = await axios.get(baseUrl+'/light');
          if(response.status === 200){
            const {value, state} = response.data.light;
            setLightInfo(state);
            console.log(lightInfo);
          }
          else{
            console.error('Failed to fetch light info')
          }
        }
        catch(error){
          console.error('Error', error);
        }
        finally{
          setLoading(false);
        }
        return lightInfo;
    }

    useEffect(()=>{
        getLightInfo();
    }, [])

    const refetch = async () => {
        const linfo = await getLightInfo();
        return linfo;
    }

    return {lightInfo, refetch}
}

export default fetchLightInfo;