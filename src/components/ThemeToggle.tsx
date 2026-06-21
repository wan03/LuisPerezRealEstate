'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';

/**
 * Global, fixed theme switch. Rendered once in the root layout so it appears
 * on every page (public, auth, dashboard, portal, admin). Sits below modals
 * (z-40) so it never overlaps dialog content.
 */
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { locale } = useTranslation();

    const isLight = theme === 'light';
    const label = locale === 'es'
        ? (isLight ? 'Activar modo oscuro' : 'Activar modo claro')
        : (isLight ? 'Switch to dark mode' : 'Switch to light mode');

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={label}
            aria-label={label}
            className="fixed bottom-5 right-5 z-40 w-11 h-11 grid place-items-center border border-line bg-panel2/90 text-mut backdrop-blur-md shadow-lg hover:text-lime hover:border-lime transition-colors active:translate-y-px"
        >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>
    );
}
