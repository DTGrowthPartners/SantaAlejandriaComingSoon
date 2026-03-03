import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import translations, { type Lang } from "./translations";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "es" ? "en" : "es"));
  }, []);

  const t = useCallback(
    (section: string, key: string): string => {
      const sec = (translations as Record<string, Record<string, Record<Lang, string>>>)[section];
      if (!sec) return key;
      const entry = sec[key];
      if (!entry) return key;
      return entry[lang] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
