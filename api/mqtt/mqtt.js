import { useState, useEffect } from 'react';
import { Client, Message } from 'react-native-paho-mqtt';
import { usePlantsContext } from '../../context/PlantsProvider';

const useMqttClient = () => {
    const { activePlant, plants } = usePlantsContext();
    const [isEnabled, setIsEnabled] = useState(false);
    const [temperature, setTemperature] = useState('');
    const [brightness, setBrightness] = useState('');
    const [waterLevel, setWaterLevel] = useState('');
    const [humidity, setHumidity] = useState('');
    const [pump, setPump] = useState(false);
    const plantId = activePlant?.plantId;
    const [client, setClient] = useState(null);
    const [statusMessage, setStatusMessage] = useState('')
    let statusCode = 0;
    let lastMessageReceived = Date.now();
    let checkInterval = null;
    const [isReceiving, setIsReceiving] = useState(false);

    const clearValues = () => {
        setTemperature('');
        setIsEnabled(false);
        setBrightness('');
        setWaterLevel('');
        setHumidity('');
        setPump(false);
        setStatusMessage('');
        statusCode = 0;
    }

    const pumpSwitch = () => {
        if (!client || !client.isConnected()) {
            console.log("MQTT Client is not connected!");
            return;
        }

        const newState = !pump ? "ON" : "OFF";

        try {
            const mqttMessage = new Message(newState);
            mqttMessage.destinationName = `${plantId}/switch/pump/command`;
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

        try {
            const mqttMessage = new Message(message);
            mqttMessage.destinationName = `${plantId}/light/lamp/command`;
            client.send(mqttMessage);

            console.log("MQTT Lamp Command Sent:", message);
            setIsEnabled(!isEnabled);
        } catch (error) {
            console.error("MQTT Publish Error:", error);
        }
    };

    const mqttFunc = () => {

        const myStorage = {
            setItem: (key, item) => {
                myStorage[key] = item;
            },
            getItem: (key) => myStorage[key],
            removeItem: (key) => {
                delete myStorage[key];
            },
        };

        const mqttClient = new Client({
            uri: "ws://192.168.10.114:9001/mqtt",
            clientId: `react_native_client_${Date.now()}`,
            storage: myStorage
        });

        mqttClient.on('connectionLost', () => {
            reconnect();
        });

        const reconnect = () => {
            console.log("Reconnecting MQTT client...");
            //console.log(client)
            if (mqttClient._client.connected) mqttClient.disconnect();
            setTimeout(() => mqttClient.connect(), 3000);
        };

        mqttClient.on('messageReceived', (message) => {
            const destination = message.destinationName;
            const messageData = message.payloadString;
            lastMessageReceived = Date.now();
            setIsReceiving(true)
            if (destination === `${plantId}/sensor/temp/state`) {
                setTemperature(messageData + " °C");
            } else if (destination === `${plantId}/sensor/lux/state`) {
                setBrightness(messageData + "%");
            } else if (destination === `${plantId}/sensor/ultrasonic_sensor/state`) {
                setWaterLevel(messageData + " cm");
            } else if (destination === `${plantId}/sensor/soil_moisture/state`) {
                setHumidity(messageData + "%");
            } else if (destination === `${plantId}/light/lamp/state`) {
                const stateData = JSON.parse(messageData);
                const lampState = stateData.state === "ON";
                setIsEnabled(lampState);
            } else if (destination === `${plantId}/switch/pump/state`) {
                setPump(messageData === "ON");
            } else if (destination === `${plantId}/sensor/plant_status/state`) {
                setStatusMessage(messageData)
                if (messageData === "Very well") {
                    statusCode = 1;
                }
            }
        });

        const monitorMessages = () => {
            checkInterval = setInterval(() => {
                const now = Date.now();
                if (now - lastMessageReceived > 30000) {
                    console.log("No messages received for 30s. Reconnecting...");
                    setIsReceiving(false);
                    reconnect();
                }
            }, 5000);
        };

        mqttClient.connect({ userName: "musashi", password: "dAnnI_73" })
            .then(() => {
                console.log('Connected to MQTT');
                const topics = [
                    `${plantId}/sensor/temp/state`,
                    `${plantId}/sensor/lux/state`,
                    `${plantId}/sensor/ultrasonic_sensor/state`,
                    `${plantId}/sensor/soil_moisture/state`,
                    `${plantId}/light/lamp/state`,
                    `${plantId}/switch/pump/state`,
                    `${plantId}/sensor/plant_status/state`
                ];
                topics.forEach(topic => {
                    mqttClient.subscribe(topic, { qos: 1 }).catch(error => {
                        console.log('Failed to subscribe:', topic, error);
                    });
                });
                monitorMessages()
            })
            .catch((error) => {
                console.log('Connection failed:', error);
            });

        setClient(mqttClient);

        const clientDisconnect = () => {
            console.log('Disconnecting from MQTT');
            if (mqttClient.isConnected()) {
                const topics = [
                    `${plantId}/sensor/temp/state`,
                    `${plantId}/sensor/lux/state`,
                    `${plantId}/sensor/ultrasonic_sensor/state`,
                    `${plantId}/sensor/soil_moisture/state`,
                    `${plantId}/light/lamp/state`,
                    `${plantId}/switch/pump/state`,
                    `${plantId}/sensor/plant_status/state`
                ];

                topics.forEach(topic => mqttClient.unsubscribe(topic));
                mqttClient.disconnect();
            }
        };

        return { clientDisconnect };

    }

    useEffect(() => {
        if (plants && plants.length > 0) {
            const { clientDisconnect } = mqttFunc()
            return () => {
                clearInterval(checkInterval);
                clientDisconnect();
                clearValues();
            };
        }
    }, [plantId]);


    return { client, temperature, brightness, waterLevel, humidity, isEnabled, pump, pumpSwitch, lampSwitch, status: { statusCode, statusMessage }, isReceiving };
};

export default useMqttClient;

