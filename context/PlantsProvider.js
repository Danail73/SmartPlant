import { createContext, useContext, useState, useEffect } from 'react';
import { getAllPlants } from '../lib/appwrite';
import { useGlobalContext } from './GlobalProvider';

const PlantsContext = createContext();
export const usePlantsContext = () => useContext(PlantsContext);

const PlantsProvider = ({ children }) => {
    const { user } = useGlobalContext()
    const [plants, setPlants] = useState([]);
    const [activePlant, setActivePlant] = useState(null)
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlants = async () => {
        try {
            const plants = await getAllPlants();
            return plants
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (user?.$id) {
            fetchPlants()
                .then((response) => {
                    if (response) {
                        setPlants(response)
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

    return (
        <PlantsContext.Provider
            value={{
                setPlants,
                plants,
                setActivePlant,
                activePlant
            }}
        >
            {children}
        </PlantsContext.Provider>
    )
}

export default PlantsProvider;