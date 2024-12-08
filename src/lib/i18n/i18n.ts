import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import zh from './zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh }
    },
    fallbackLng: 'en',
    lng: 'zh', // 根据你的页面默认语言设置
    interpolation: {
      escapeValue: false
    },
    debug: true, // 开发时启用调试
    keySeparator: '.', // 启用嵌套键值支持
    react: {
      useSuspense: false
    }
  });

export default i18n;