'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

export type Locale = 'en' | 'es';

const messages: Record<Locale, typeof en> = { en, es };

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useTranslation() {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        // Fallback for components outside provider — returns English
        return {
            locale: 'en' as Locale,
            setLocale: () => { },
            t: (key: string) => {
                const parts = key.split('.');
                let value: unknown = en;
                for (const part of parts) {
                    if (value && typeof value === 'object') {
                        value = (value as Record<string, unknown>)[part];
                    } else {
                        return key;
                    }
                }
                return typeof value === 'string' ? value : key;
            },
        };
    }
    return ctx;
}

const LOCALE_COOKIE = 'lp-locale';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    // Read persisted locale on mount
    useEffect(() => {
        const saved = document.cookie
            .split('; ')
            .find(c => c.startsWith(`${LOCALE_COOKIE}=`))
            ?.split('=')[1] as Locale | undefined;

        if (saved && (saved === 'en' || saved === 'es')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
        document.documentElement.lang = newLocale;
    }, []);

    const t = useCallback((key: string): string => {
        const parts = key.split('.');
        let value: unknown = messages[locale];
        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = (value as Record<string, unknown>)[part];
            } else {
                return key; // Fallback: return the key itself
            }
        }
        return typeof value === 'string' ? value : key;
    }, [locale]);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}
