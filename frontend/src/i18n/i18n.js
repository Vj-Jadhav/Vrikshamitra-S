import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import 'intl-pluralrules';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    pa: { translation: pa },
};

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: (callback) => {
        const bestLanguage = RNLocalize.findBestLanguageTag(['en', 'hi', 'pa']);
        callback(bestLanguage?.languageTag || 'en');
    },
    init: () => { },
    cacheUserLanguage: () => { },
};

i18n
    .use(initReactI18next)
    .use(languageDetector)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v3',
    });

export default i18n;
