// src/components/ClientProvider.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/i18n";

interface ClientProviderProps {
  children: ReactNode;
}

const ClientProvider = ({ children }: ClientProviderProps) => {
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    const browserLang = navigator.language.split("-")[0];
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    } else if (["en", "zh"].includes(browserLang)) {
      i18n.changeLanguage(browserLang);
      localStorage.setItem("language", browserLang);
    } else {
      i18n.changeLanguage("en"); // 默认语言
      localStorage.setItem("language", "en");
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default ClientProvider;
