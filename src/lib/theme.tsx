'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'lp-theme';

/**
 * Applies the theme to <html>. The dark theme is the default (no attribute),
 * so we only set [data-theme="light"] when the light theme is active.
 */
function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
    } else {
        root.removeAttribute('data-theme');
    }
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        // Fallback for components rendered outside the provider — assumes dark.
        return {
            theme: 'dark' as Theme,
            setTheme: () => { },
            toggleTheme: () => { },
        };
    }
    return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Default to dark. The inline script in layout.tsx has already applied the
    // persisted theme before paint, so this only syncs React state on mount.
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(THEME_KEY) as Theme | null;
            if (saved === 'light' || saved === 'dark') {
                setThemeState(saved);
                applyTheme(saved);
            }
        } catch {
            /* localStorage unavailable — stay on default dark */
        }
    }, []);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        applyTheme(next);
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch {
            /* ignore persistence failures */
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
