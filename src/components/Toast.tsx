'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Return a no-op if used outside provider (graceful fallback)
        return { addToast: () => { } };
    }
    return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastIdRef = useRef(0);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = `toast-${++toastIdRef.current}`;
        setToasts(prev => [...prev, { id, type, message }]);

        // Auto-dismiss after 4s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const icons = {
        success: <CheckCircle2 size={18} className="text-lime" />,
        error: <AlertCircle size={18} className="text-org" />,
        info: <Info size={18} className="text-blue2" />,
    };

    const accents = {
        success: 'before:bg-lime',
        error: 'before:bg-org',
        info: 'before:bg-blue',
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto relative flex items-center gap-3 pl-6 pr-5 py-4 bg-panel border border-line shadow-2xl text-ink font-bold text-[13px] max-w-sm animate-slide-in before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${accents[toast.type]}`}
                    >
                        {icons[toast.type]}
                        <span className="flex-1">{toast.message}</span>
                        <button onClick={() => dismiss(toast.id)} className="text-mut hover:text-ink transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
