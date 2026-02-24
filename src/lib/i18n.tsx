"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Locale = "en" | "zh-CN" | "zh-TW" | "es" | "fr";

export const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文", flag: "🇹🇼" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

import en from "@/messages/en";
import zhCN from "@/messages/zh-CN";
import zhTW from "@/messages/zh-TW";
import es from "@/messages/es";
import fr from "@/messages/fr";

/* eslint-disable @typescript-eslint/no-explicit-any */
const allMessages: Record<Locale, Record<string, any>> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  es,
  fr,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

function getNestedValue(obj: any, path: string): string {
  const result = path.split(".").reduce((acc, part) => acc?.[part], obj);
  return typeof result === "string" ? result : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && allMessages[saved]) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    const langMap: Record<Locale, string> = {
      en: "en",
      "zh-CN": "zh-Hans",
      "zh-TW": "zh-Hant",
      es: "es",
      fr: "fr",
    };
    document.documentElement.lang = langMap[locale] || "en";
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  const t = (key: string): string => {
    const val = getNestedValue(allMessages[locale], key);
    if (val === key) {
      // Fallback to English
      return getNestedValue(allMessages.en, key);
    }
    return val;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
