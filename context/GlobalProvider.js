import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/appwrite';
import { useLanguage } from '../translations/i18n';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const {language, switchLanguage} = useLanguage();

    useEffect(() => {
        getCurrentUser()
            .then((response) => {
                if(response){
                    setIsLoggedIn(true);
                    setUser(response)
                    tempUser = response
                }
                else{
                    setIsLoggedIn(false);
                    setUser(null)
                }
            })
            .catch((error)=>{
                console.log('error')
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, [])

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                isLoading,
                language,
                switchLanguage
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider;