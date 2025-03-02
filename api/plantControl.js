import axios from "axios";
const baseUrl = 'http://192.168.3.20:3000/';

  const url1 = 'http://192.168.3.134'

//export let canselToken = false;

export const fetchTemp = async (plantId) => {
    try {
        const response = await fetchData(plantId, '/getTemp');
        if (response.status === 200) {
            const { value } = response.data.temperature;
            return value;
        }
        else
            console.log('Failed to fetch temperature')
    } catch (error) {
        throw new Error(error);
    }
}

export const fetchLampState = async (plantId) => {
    try {
        const response = await fetchData(plantId, '/lamp');
        if (response.status === 200) {
            const state = response.data.lamp.state;
            if (String(state).trim() === "OFF")
                return false;
            else if (String(state).trim() === "ON")
                return true;
            else
                console.log(`Unexpected state value: "${state}"`);
        }
        else
            console.log('Failed to fetch lamp state');
    } catch (error) {
        throw new Error(error);
    }
}

export const fetchLightInfo = async (plantId) => {
    try {
        const response = await fetchData(plantId, '/light')
        if (response.status === 200) {
            const { value, state } = response.data.light;
            return value;
        }
        else {
            console.error('Failed to fetch light info')
        }
    } catch (error) {
        throw new Error(error);
    }
}

export const fetchWaterLevel = async (plantId) => {
    try {
        const response = await fetchData(plantId, '/waterLevel')
        if (response.status === 200) {
            const { value, state } = response.data.water;
            return value;
        }
        else {
            console.error('Failed to fetch water level')
        }

    } catch (error) {
        throw new Error(error);
    }
}

export const turnLampOn = async (plantId) => {
    try {
        const response = await fetchData(plantId, '/lampOn')
        if (response.status === 200)
            return response;
        else
            console.log('Failed to turn lamp on')
    } catch (error) {
        throw new Error(error);
    }
}

export const turnLampOff = async (plantId) => {
    try {
        const response = await fetchData(plantId, '/lampOff')
        if (response.status === 200)
            return response;
        else
            console.log('Failed to turn lamp off')
    } catch (error) {
        throw new Error(error);
    }
}

const fetchData = async (plantId, url) => {
    try {
        const response = await axios.get(baseUrl + plantId + url);
        return response;
    } catch (error) {
        throw new Error(error);
    }

}

export const fetchEverything = async () => {
    try {
      const response = await axios.get(url1 + '/text_sensor/sensor_data')
      const {value} = response.data
      const data = JSON.parse(value)
      return {temp: data.temperature, humidity: data.humidity, bright: data.brightness,
         distance: data.distance, lampStatus: data.lamp_status, status: data.plant_status};
    } catch (error) {
      throw new Error(error);
    }
  }

