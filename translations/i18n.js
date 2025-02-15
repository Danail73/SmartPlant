import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import en from './locales/en.json';
import bg from './locales/bg.json';

i18n.translations = {
  en,
  bg,
};

i18n.locale = Localization.getLocales()[0].languageCode;

i18n.fallbacks = true;

export const t = i18n.t

export default i18n;
