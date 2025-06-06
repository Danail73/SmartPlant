import * as Localization from 'expo-localization';
import {I18n} from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react'
import en from './locales/en.json';
import bg from './locales/bg.json';

//configuring languages
export const i18n = new I18n ({
  en,
  bg
});

//function for initial setup of the language
const getInitialLanguage = async () => {
  const savedLocale = await AsyncStorage.getItem('appLanguage');
  return savedLocale || Localization.getLocales()[0]?.languageCode || 'en';
};

//function to change language
export const changeLanguage = async (lang) => {
  i18n.locale = lang;
  await AsyncStorage.setItem('appLanguage', lang);
};

//custom hook for setup and changing language
export const useLanguage = () => {
  const [language, setLanguage] = useState(i18n.locale);

  useEffect(() => {
    getInitialLanguage()
      .then((lang) => {
        changeLanguage(lang)
        setLanguage(lang);
      })
      
  }, [])

  const switchLanguage = async (lang) => {
    await changeLanguage(lang);
    setLanguage(lang);
  };

  return { language, switchLanguage };
};

i18n.enableFallback = true;

//using t function to translate in the app
export const t = (scope, options) => i18n.t(scope, options);
