import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import zh from "./zh.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  fallbackLng: "en",
  lng: "zh",
  interpolation: {
    escapeValue: false,
  },
  debug: false,
  keySeparator: ".",
  react: {
    useSuspense: false,
  },
});

export default i18n;
