import { createContext, useContext, useState, useEffect } from 'react';
import { getAllPlants } from '../lib/appwrite';
import { useGlobalContext } from './GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlantsContext = createContext();
export const usePlantsContext = () => useContext(PlantsContext);

const PlantsProvider = ({ children }) => {
    const { user } = useGlobalContext()
    const [plants, setPlants] = useState([]);
    const [activePlant, setActivePlant] = useState(null)
    const [activeId, setActiveId] = useState(null)
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlants = async () => {
        try {
            const plants = await getAllPlants();
            return plants
        } catch (error) {
            console.log(error)
        }
    }

    const storeItem = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
            console.log("Item stored successfully!");
        } catch (error) {
            console.error("Error storing item:", error);
        }
    }

    const fetchRealTime = async () => {
        fetchPlants()
            .then((response) => {
                if (response) {
                    const currentPlants = response.filter((item) => item.users.some((u) => u.$id === user.$id))
                    setPlants(currentPlants)
                }

            })
            .catch((error) => {
                console.log('error')
            })
    }

    useEffect(() => {
        if (user?.$id) {
            fetchPlants()
                .then((response) => {
                    if (response) {
                        const currentPlants = response.filter((item) => item.users.some((u) => u.$id === user.$id))
                        setPlants(currentPlants)
                    }

                })
                .catch((error) => {
                    console.log('error')
                })
                .finally(() => {
                    setIsLoading(false);
                })
        }
    }, [user])

    useEffect(() => {
        storeItem("temperature", JSON.stringify(0));
        storeItem("humidity", JSON.stringify(0));
        storeItem("brightness", JSON.stringify(0));
        storeItem("water", JSON.stringify(0));
        storeItem("statusCode", JSON.stringify(0));
    }, [activeId])

    return (
        <PlantsContext.Provider
            value={{
                setPlants,
                plants,
                setActivePlant,
                activePlant,
                activeId,
                setActiveId,
                storeItem,
                fetchRealTime
            }}
        >
            {children}
        </PlantsContext.Provider>
    )
}

export default PlantsProvider;