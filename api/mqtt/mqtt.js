import { useState, useEffect, useRef } from 'react';
import { Client, Message } from 'react-native-paho-mqtt';
import { usePlantsContext } from '../../context/PlantsProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useMqttClient = () => {
    const username = 'musashi';
    const password = 'dAnnI_73';
    const { activePlant, plants } = usePlantsContext();

    const [temperature, setTemperature] = useState(null);
    const [brightness, setBrightness] = useState(null);
    const [waterLevel, setWaterLevel] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [pump, setPump] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [status, setStatus] = useState({ code: 0, message: '' });
    const [isReceiving, setIsReceiving] = useState(false);
    const [client, setClient] = useState(null);

    const plantId = activePlant?.plantId;
    const clientRef = useRef(null);

    const clearValues = () => {
        setTemperature(null);
        setBrightness(null);
        setWaterLevel(null);
        setHumidity(null);
        setPump(false);
        setIsEnabled(false);
        setStatus({ code: 0, message: '' });
        setIsReceiving(false);
    };

    const setStorageItem = async (key, value) => {
        await AsyncStorage.setItem(key, value)
    }

    const createClient = () => {
        const myStorage = {
            setItem: (key, item) => { myStorage[key] = item; },
            getItem: (key) => myStorage[key],
            removeItem: (key) => { delete myStorage[key]; },
        };

        return new Client({
            uri: "ws://78.130.186.241:9001/mqtt",
            clientId: `react_native_client_${Date.now()}`,
            storage: myStorage,
        });
    };

    const pumpSwitch = () => {
        if (!client || !client.isConnected()) {
            console.log("MQTT Client is not connected!");
            return;
        }

        const newState = !pump ? "ON" : "OFF";
        const mqttMessage = new Message(newState);
        mqttMessage.destinationName = `${plantId}/switch/pump/state`;

        try {
            client.send(mqttMessage);
            console.log("MQTT Pump Command Sent:", newState);
            setPump(!pump);
        } catch (error) {
            console.error("MQTT Publish Error:", error);
        }
    };

    const lampSwitch = () => {
        if (!client || !client.isConnected()) {
            console.log("MQTT Client is not connected!");
            return;
        }

        const newState = !isEnabled ? "ON" : "OFF";
        const message = JSON.stringify({ state: newState });
        const mqttMessage = new Message(message);
        mqttMessage.destinationName = `${plantId}/light/lamp/state`;

        try {
            client.send(mqttMessage);
            console.log("MQTT Lamp Command Sent:", message);
            setIsEnabled(!isEnabled);
        } catch (error) {
            console.error("MQTT Publish Error:", error);
        }
    };

    useEffect(() => {
        if (!plantId || !plants || plants.length === 0) return;

        const mqttClient = createClient();
        clientRef.current = mqttClient;

        mqttClient.on('connectionLost', () => {
            console.log("MQTT Connection lost. Reconnecting...");
            setIsReceiving(false)
        });

        mqttClient.on('messageReceived', (message) => {
            const destination = message.destinationName;
            const messageData = message.payloadString;
            setIsReceiving(true);

            if (messageData) {
                switch (destination) {
                    case `${plantId}/sensor/temp/state`:
                        setTemperature(() => messageData);
                        setStorageItem("temperature", messageData)
                        break;
                    case `${plantId}/sensor/lux/state`:
                        setBrightness(() => messageData);
                        setStorageItem("brightness", messageData)
                        break;
                    case `${plantId}/sensor/ultrasonic_sensor/state`:
                        setWaterLevel(() => messageData);
                        setStorageItem("water", messageData)
                        break;
                    case `${plantId}/sensor/soil_moisture/state`:
                        setHumidity(() => messageData);
                        setStorageItem("humidity", messageData)
                        break;
                    case `${plantId}/light/lamp/state`:
                        setIsEnabled(() => JSON.parse(messageData).state === "ON");
                        break;
                    case `${plantId}/switch/pump/state`:
                        setPump(() => messageData === "ON");
                        break;
                    case `${plantId}/sensor/plant_status/state`:
                        const statusCode = messageData === "Very well" ? 1 : 0
                        setStatus({ code: statusCode, message: messageData });
                        setStorageItem("statusCode", JSON.stringify(statusCode))
                        break;
                    default:
                        console.log("Unknown topic:", destination);
                }
            }
        });

        mqttClient.connect({ userName: username, password: password, reconnect: true })
            .then(() => {
                console.log('Connected to MQTT');
                const topics = [
                    `${plantId}/sensor/temp/state`,
                    `${plantId}/sensor/lux/state`,
                    `${plantId}/sensor/ultrasonic_sensor/state`,
                    `${plantId}/sensor/soil_moisture/state`,
                    `${plantId}/light/lamp/state`,
                    `${plantId}/switch/pump/state`,
                    `${plantId}/sensor/plant_status/state`,
                ];
                topics.forEach(topic => mqttClient.subscribe(topic, { qos: 1 }).catch(console.error));
            })
            .catch(console.error);

        setClient(mqttClient);

        return () => {
            console.log('Disconnecting MQTT');
            if (clientRef.current?.isConnected()) {
                clientRef.current.disconnect();
            }
            clearValues();
        };
    }, [plantId]);

    return { client, temperature, brightness, waterLevel, humidity, isEnabled, pump, pumpSwitch, lampSwitch, status, isReceiving };
};

export default useMqttClient;

