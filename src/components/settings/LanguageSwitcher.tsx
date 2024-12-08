// src/components/LanguageSwitcher.tsx
"use client";

import { useTranslation } from 'react-i18next';
import React from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex space-x-2">
      <button 
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
      <button 
        onClick={() => changeLanguage('zh')}
        className={`px-3 py-1 rounded ${i18n.language === 'zh' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
      >
        中文
      </button>
    </div>
  );
}

export default LanguageSwitcher;