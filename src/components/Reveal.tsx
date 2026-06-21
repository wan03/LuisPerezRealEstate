'use client';

import React, { useEffect, useRef } from 'react';

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    /** Render as a different element (defaults to a section). */
    as?: React.ElementType;
    id?: string;
}

/**
 * Wraps content with a subtle "fade + rise" reveal as it scrolls
 * into view. Uses the `.reveal` / `.reveal.in` classes defined in
 * globals.css and degrades gracefully (content is visible if JS or
 * IntersectionObserver is unavailable, and motion is disabled when
 * the user prefers reduced motion).
 */
export default function Reveal({ children, className = '', as, id }: RevealProps) {
    const ref = useRef<HTMLElement>(null);
    const Tag = (as || 'section') as React.ElementType;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (!('IntersectionObserver' in window)) {
            el.classList.add('in');
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.07 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <Tag ref={ref} id={id} className={`reveal ${className}`}>
            {children}
        </Tag>
    );
}
