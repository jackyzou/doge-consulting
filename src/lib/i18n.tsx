"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export type Locale = "en" | "zh-CN" | "zh-TW" | "es" | "fr";

export const LOCALES: { code: Locale; name: string; flag: string; currency: string; currencySymbol: string }[] = [
  { code: "en", name: "English", flag: "\u{1F1FA}\u{1F1F8}", currency: "USD", currencySymbol: "$" },
  { code: "zh-CN", name: "简体中文", flag: "\u{1F1E8}\u{1F1F3}", currency: "CNY", currencySymbol: "\u00A5" },
  { code: "zh-TW", name: "繁體中文", flag: "\u{1F1ED}\u{1F1F0}", currency: "HKD", currencySymbol: "HK$" },
  { code: "es", name: "Español", flag: "\u{1F1EA}\u{1F1F8}", currency: "MXN", currencySymbol: "MX$" },
  { code: "fr", name: "Français", flag: "\u{1F1EB}\u{1F1F7}", currency: "EUR", currencySymbol: "\u20AC" },
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
  const serverSynced = useRef(false);

  // On mount: restore from localStorage first, then try to sync with server
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && allMessages[saved]) {
      setLocaleState(saved);
    }

    // If user is signed in, fetch their language preference from the server
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.language && allMessages[data.user.language as Locale]) {
          const serverLocale = data.user.language as Locale;
          // Server preference takes priority for signed-in users
          setLocaleState(serverLocale);
          localStorage.setItem("locale", serverLocale);
          serverSynced.current = true;
        }
      })
      .catch(() => {
        // Not signed in or error — use localStorage
      });
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

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);

    // Sync to server if user is signed in (fire-and-forget)
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          fetch("/api/customer/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: data.user.name, language: l }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

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

// ── Currency formatting per locale ────────────────────────────
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  CNY: 7.2,
  HKD: 7.8,
  MXN: 17.2,
  EUR: 0.92,
};

export function useLocaleCurrency() {
  const { locale } = useContext(I18nContext);
  const loc = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  const formatPrice = (usdAmount: number, decimals = 0): string => {
    if (loc.currency === "USD") {
      return `$${usdAmount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }
    const rate = EXCHANGE_RATES[loc.currency] || 1;
    const converted = usdAmount * rate;
    const local = `${loc.currencySymbol}${converted.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    const usd = `$${usdAmount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    return `${local} (${usd})`;
  };

  return { formatPrice, currency: loc.currency, currencySymbol: loc.currencySymbol };
}
