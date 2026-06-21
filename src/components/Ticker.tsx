'use client';

import React from 'react';

/**
 * Scrolling market-stats ticker shown beneath the hero. The numbers
 * are static brand/marketing content (no live data source yet); the
 * item list is rendered twice so the CSS marquee loops seamlessly
 * (the track translates by -50%).
 */
const ITEMS = [
    'Sebring ▴ +6.2% YoY',
    'Avon Park ▴ +4.8%',
    'Median $342K',
    'Lake Placid ▴ +5.1%',
    'Lakefront ▴ +9.3%',
    'Avg DOM 27d',
    'Highlands Acreage ▴ +11%',
    'Polk Border Active',
    'Highlands County Growth',
    'New Listings Daily',
];

export default function Ticker() {
    const items = [...ITEMS, ...ITEMS];
    return (
        <div className="bg-lime text-bg overflow-hidden">
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
