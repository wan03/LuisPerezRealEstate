'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
    /** Final value to count to. */
    end: number;
    /** Animation duration in ms. */
    duration?: number;
    prefix?: string;
    suffix?: string;
    /** Format the number with thousands separators. */
    separator?: boolean;
    className?: string;
    /** If true, only start once scrolled into view. */
    onView?: boolean;
}

/**
 * Lightweight animated number counter used on the landing hero
 * and the "Proof" stat cards. Respects prefers-reduced-motion by
 * jumping straight to the final value.
 */
export default function CountUp({
    end,
    duration = 1400,
    prefix = '',
    suffix = '',
    separator = true,
    className,
    onView = false,
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [value, setValue] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        const run = () => {
            if (started.current) return;
            started.current = true;

            if (prefersReduced) {
                setValue(end);
                return;
            }

            const t0 = performance.now();
            const step = (t: number) => {
                const p = Math.min(1, (t - t0) / duration);
                const eased = 1 - Math.pow(1 - p, 3);
                setValue(Math.round(end * eased));
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        if (!onView) {
            run();
            return;
        }

        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        run();
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [end, duration, onView]);

    const formatted = separator ? value.toLocaleString() : String(value);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {formatted}
            {suffix}
        </span>
    );
}
