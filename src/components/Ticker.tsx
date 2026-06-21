'use client';

import React from 'react';

/**
 * Scrolling market-stats ticker shown beneath the hero. The numbers
 * are static brand/marketing content (no live data source yet); the
 * item list is rendered twice so the CSS marquee loops seamlessly
 * (the track translates by -50%).
 */
const ITEMS = [
    'Lakeland ▴ +6.2% YoY',
    'Winter Haven ▴ +4.8%',
    'Median $342K',
    'Plant City ▴ +5.1%',
    'Bartow Land ▴ +9.3%',
    'Avg DOM 27d',
    'Auburndale ▴ +3.9%',
    'Mulberry Acreage ▴ +11%',
    'I-4 Corridor Active',
    'Polk County #1 Growth',
    'New Listings Daily',
];

export default function Ticker() {
    const items = [...ITEMS, ...ITEMS];
    return (
        <div className="bg-lime text-accentink overflow-hidden">
            <div className="lp-ticker-track py-2.5">
                {items.map((item, i) => (
                    <span
                        key={i}
                        className="font-mono text-[12.5px] font-bold tracking-[0.04em] inline-flex gap-2.5 items-center"
                    >
                        <i className="text-black/35 not-italic">◆</i>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
