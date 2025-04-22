import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentAccount, getCurrentUser } from '../lib/appwrite';
import { useLanguage } from '../translations/i18n';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { language, switchLanguage } = useLanguage();
    const [account, setAccount] = useState(null)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getCurrentUser();
    
                if (response) {
                    setIsLoggedIn(true);
                    setUser(response);
    
                    try {
                        const acc = await getCurrentAccount();
                        if (acc) {
                            setAccount(acc);
                        }
                    } catch (err) {
                        console.log('Error fetching account:', err);
                    }
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } catch (err) {
                console.log('Error fetching user:', err);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchUserData();
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
                switchLanguage,
                account,
                setAccount
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider;