'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  isSystem: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'meddexplorer-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [userPreference, setUserPreference] = useState<ThemeMode | null>(null);
  const [systemTheme, setSystemTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setUserPreference(stored);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };
    syncSystemTheme();
    mediaQuery.addEventListener('change', syncSystemTheme);
    return () => mediaQuery.removeEventListener('change', syncSystemTheme);
  }, []);

  const effectiveTheme: ThemeMode = userPreference ?? systemTheme;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.dataset.theme = effectiveTheme;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  const applyPreference = useCallback((value: ThemeMode | null) => {
    setUserPreference(value);
    if (typeof window === 'undefined') {
      return;
    }
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const baseline = (userPreference ?? effectiveTheme) === 'dark' ? 'light' : 'dark';
    applyPreference(baseline);
  }, [applyPreference, effectiveTheme, userPreference]);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      applyPreference(mode);
    },
    [applyPreference]
  );

  const resetTheme = useCallback(() => {
    applyPreference(null);
  }, [applyPreference]);

  const value = useMemo(
    () => ({
      theme: effectiveTheme,
      isSystem: userPreference === null,
      toggleTheme,
      setTheme,
      resetTheme,
    }),
    [effectiveTheme, resetTheme, setTheme, toggleTheme, userPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}
