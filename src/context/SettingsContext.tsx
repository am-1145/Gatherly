import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrencyCode } from '../types';

interface SettingsContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  dateFormat: string;
  setDateFormat: (f: string) => void;
  aiMode: 'local_demo' | 'gemini_api';
  setAiMode: (m: 'local_demo' | 'gemini_api') => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  saveAISettings: (mode: 'local_demo' | 'gemini_api', apiKey: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'gatherly_app_settings_v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(`${SETTINGS_KEY}_theme`);
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem(`${SETTINGS_KEY}_currency`) as CurrencyCode;
      return stored || 'INR';
    } catch {
      return 'INR';
    }
  });

  const [dateFormat, setDateFormatState] = useState<string>(() => {
    try {
      return localStorage.getItem(`${SETTINGS_KEY}_date_format`) || 'DD/MM/YYYY';
    } catch {
      return 'DD/MM/YYYY';
    }
  });

  const [aiMode, setAiModeState] = useState<'local_demo' | 'gemini_api'>(() => {
    try {
      const stored = localStorage.getItem(`${SETTINGS_KEY}_ai_mode`);
      return stored === 'gemini_api' ? 'gemini_api' : 'local_demo';
    } catch {
      return 'local_demo';
    }
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(`${SETTINGS_KEY}_gemini_key`) || '';
    } catch {
      return '';
    }
  });

  // Apply dark mode class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(`${SETTINGS_KEY}_theme`, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(`${SETTINGS_KEY}_currency`, c);
  }, []);

  const setDateFormat = useCallback((f: string) => {
    setDateFormatState(f);
    localStorage.setItem(`${SETTINGS_KEY}_date_format`, f);
  }, []);

  const setAiMode = useCallback((m: 'local_demo' | 'gemini_api') => {
    setAiModeState(m);
    localStorage.setItem(`${SETTINGS_KEY}_ai_mode`, m);
  }, []);

  const saveAISettings = useCallback(
    (mode: 'local_demo' | 'gemini_api', apiKey: string) => {
      setAiModeState(mode);
      setGeminiApiKey(apiKey);
      localStorage.setItem(`${SETTINGS_KEY}_ai_mode`, mode);
      localStorage.setItem(`${SETTINGS_KEY}_gemini_key`, apiKey);
    },
    []
  );

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        dateFormat,
        setDateFormat,
        aiMode,
        setAiMode,
        geminiApiKey,
        setGeminiApiKey,
        saveAISettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

