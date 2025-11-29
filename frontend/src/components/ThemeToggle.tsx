'use client';

import { ReactNode } from 'react';
import { useThemeMode } from './ThemeProvider';

type ThemeSelection = 'system' | 'light' | 'dark';

const buttonBase =
  'inline-flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5A7836]';

const iconClasses = 'h-4 w-4';

function SunIcon() {
  return (
    <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07-7.07-1.41 1.41M6.34 17.66l-1.41 1.41m0-12.72 1.41 1.41m12.72 12.72-1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 14.5A9 9 0 0 1 10.5 4 7 7 0 1 0 21 14.5Z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, isSystem, setTheme, resetTheme } = useThemeMode();

  const active: ThemeSelection = isSystem ? 'system' : theme;

  const selectTheme = (selection: ThemeSelection) => {
    if (selection === 'system') {
      resetTheme();
    } else {
      setTheme(selection);
    }
  };

  const buttons: Array<{ value: ThemeSelection; icon: ReactNode; label: string }> = [
    { value: 'light', icon: <SunIcon />, label: 'Switch to light mode' },
    { value: 'dark', icon: <MoonIcon />, label: 'Switch to dark mode' },
    { value: 'system', icon: <SystemIcon />, label: 'Follow system preference' },
  ];

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-2 py-1 shadow-sm backdrop-blur dark:border-[#2c2c2c] dark:bg-[#141414]/70">
      {buttons.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => selectTheme(value)}
          aria-pressed={active === value}
          className={`${buttonBase} ${
            active === value
              ? 'bg-primary-600 text-white dark:bg-[#5A7836]'
              : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white'
          }`}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
