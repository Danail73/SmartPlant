// MqttProvider.js
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client, Message } from 'react-native-paho-mqtt';
import { usePlantsContext } from './PlantsProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useGlobalContext } from './GlobalProvider';

const MqttContext = createContext();
export const useMqttContext = () => useContext(MqttContext);

const MqttProvider = ({ children }) => {
    const username = 'musashi';
    const password = 'dAnnI_73';
    const { activePlant, plants } = usePlantsContext();
    const { user } = useGlobalContext();

    const [temperature, setTemperature] = useState(null);
    const [brightness, setBrightness] = useState(null);
    const [waterLevel, setWaterLevel] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [pump, setPump] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [status, setStatus] = useState({ code: 0, message: '' });
    const [isReceiving, setIsReceiving] = useState(false);
    const [client, setClient] = useState(null);

    const clientRef = useRef(null);
    const topicsRef = useRef([]);
    const reconnectIntervalRef = useRef(null);
    const plantId = activePlant?.plantId;

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
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.warn("Storage error:", e);
        }
    };

    const getPersistentClientId = async () => {
        let id = await AsyncStorage.getItem("mqtt_client_id");
        if (!id) {
            id = `react_native_client_${Date.now()}`;
            await AsyncStorage.setItem("mqtt_client_id", id);
        }
        return id;
    };

    const createClient = async () => {
        const myStorage = {
            setItem: (key, item) => { myStorage[key] = item; },
            getItem: (key) => myStorage[key],
            removeItem: (key) => { delete myStorage[key]; },
        };

        const clientId = await getPersistentClientId();

        return new Client({
            uri: "ws://78.130.186.241:9001/mqtt",
            clientId,
            storage: myStorage,
        });
    };

    const subscribeToTopics = async (client) => {
        if (!plantId) return;
        const topics = [
            `${plantId}/sensor/temp/state`,
            `${plantId}/sensor/lux/state`,
            `${plantId}/sensor/ultrasonic_sensor/state`,
            `${plantId}/sensor/soil_moisture/state`,
            `${plantId}/light/lamp/state`,
            `${plantId}/switch/pump/state`,
            `${plantId}/sensor/plant_status/state`,
        ];

        for (const topic of topics) {
            try {
                await client?.subscribe(topic, { qos: 1 });
                if (!topicsRef.current.includes(topic)) {
                    topicsRef.current.push(topic);
                }
            } catch (err) {
            }
        }
    };

    const connectClient = async () => {
        const mqttClient = await createClient();
        clientRef.current = mqttClient;

        mqttClient.on('connectionLost', (responseObject) => {
            console.log("MQTT connection lost:", responseObject?.errorMessage);
            setIsReceiving(false);
            startReconnectLoop();
        });

        mqttClient.on('messageReceived', (message) => {
            const destination = message.destinationName;
            const messageData = message.payloadString;
            setIsReceiving(true);

            if (messageData) {
                switch (destination) {
                    case `${plantId}/sensor/temp/state`: {
                        setTemperature(messageData);
                        setStorageItem("temperature", messageData);
                        break;
                    }
                    case `${plantId}/sensor/lux/state`: {
                        setBrightness(messageData);
                        setStorageItem("brightness", messageData);
                        break;
                    }
                    case `${plantId}/sensor/ultrasonic_sensor/state`: {
                        setWaterLevel(messageData);
                        setStorageItem("water", messageData);
                        break;
                    }
                    case `${plantId}/sensor/soil_moisture/state`: {
                        setHumidity(messageData);
                        setStorageItem("humidity", messageData);
                        break;
                    }
                    case `${plantId}/light/lamp/state`: {
                        setIsEnabled(JSON.parse(messageData).state === "ON");
                        break;
                    }
                    case `${plantId}/switch/pump/state`: {
                        setPump(messageData === "ON");
                        break;
                    }
                    case `${plantId}/sensor/plant_status/state`:{
                        const statusCode = messageData === "Very well" ? 1 : 0;
                        setStatus({ code: statusCode, message: messageData });
                        setStorageItem("statusCode", JSON.stringify(statusCode));
                        break;
                    }
                    default:
                        console.log("Unknown topic:", destination);
                }
            }
        });

        try {
            await mqttClient.connect({ userName: username, password: password, reconnect: false });
            await subscribeToTopics(mqttClient)
            console.log("MQTT Connected");
            setClient(mqttClient);
        } catch (error) {
            console.log("MQTT Connect error:", error);
            startReconnectLoop();
        }
    };

    const startReconnectLoop = () => {
        if (reconnectIntervalRef.current) return;

        reconnectIntervalRef.current = setInterval(() => {
            if (!clientRef.current?.isConnected()) {
                console.log("Trying to reconnect...");
                connectClient();
            }
        }, 10000); 
    };

    const stopReconnectLoop = () => {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
    };

    useEffect(() => {
        if (!plantId || !plants || plants.length === 0) return;

        connectClient();

        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            if (state.isConnected && !clientRef.current?.isConnected()) {
                console.log("Network is back. Reconnecting MQTT...");
                connectClient();
            }
        });

        return () => {
            console.log("Cleaning up MQTT client");
            if (clientRef.current?.isConnected()) {
                clientRef.current.disconnect();
            }
            clearValues();
            stopReconnectLoop();
            unsubscribeNetInfo();
        };
    }, [plantId,user]);

    const pumpSwitch = () => {
        if (!client || !client.isConnected()) return console.warn("MQTT not connected");
        const newState = !pump ? "ON" : "OFF";
        const msg = new Message(newState);
        msg.destinationName = `${plantId}/switch/pump/state`;
        client.send(msg);
        setPump(!pump);
    };

    const lampSwitch = () => {
        if (!client || !client.isConnected()) return console.warn("MQTT not connected");
        const newState = !isEnabled ? "ON" : "OFF";
        const msg = new Message(JSON.stringify({ state: newState }));
        msg.destinationName = `${plantId}/light/lamp/state`;
        client.send(msg);
        setIsEnabled(!isEnabled);
    };

    return (
        <MqttContext.Provider
            value={{
                temperature,
                brightness,
                waterLevel,
                humidity,
                isEnabled,
                pump,
                pumpSwitch,
                lampSwitch,
                status,
                isReceiving,
                clientConnected: client?.isConnected?.() || false,
            }}
        >
            {children}
        </MqttContext.Provider>
    );
};

export default MqttProvider;
