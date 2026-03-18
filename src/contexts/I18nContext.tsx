import React, { createContext, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next, { type Language, SUPPORTED_LANGUAGES } from "@/i18n";

const STORAGE_KEY = "hopterlink_language";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") return stored;
    } catch {
      // ignore
    }
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === "fr" ? "fr" : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    i18next.changeLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  // Sync i18next on first render
  React.useEffect(() => {
    i18next.changeLanguage(language);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <I18nContext.Provider
      value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
