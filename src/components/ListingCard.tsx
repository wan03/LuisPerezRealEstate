'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ListingProps {
    id: string;
    title: string;
    price: number;
    location: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    zoning?: string;
    floodZone?: string;
    schoolRating?: number;
    isVacantLand?: boolean;
    size?: string;
    isNew?: boolean;
}

export default function ListingCard({ listing }: { listing: ListingProps }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => { });
                        setIsPlaying(true);
                    } else {
                        videoRef.current?.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.6 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatPrice = (n: number) =>
        n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n.toLocaleString()}`;

    return (
        <div className="bg-panel border border-line overflow-hidden transition-all hover:border-blue hover:-translate-y-[3px] group">
            {/* Media */}
            <div className="relative aspect-[16/11] bg-[#0c1119] cursor-pointer overflow-hidden" onClick={togglePlay}>
                {listing.videoUrl ? (
                    <video
                        ref={videoRef}
                        src={listing.videoUrl}
                        poster={listing.thumbnailUrl}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                    />
                ) : (
                    <>
                        {/* Blueprint stripe placeholder */}
                        <div
                            className="absolute inset-0"
                            style={{ background: 'repeating-linear-gradient(135deg,#10151e 0 12px,#0c1119 12px 24px)' }}
                        />
                        <div className="absolute inset-0 grid place-items-center font-mono text-[10px] tracking-[0.12em] uppercase text-[#2c3749]">
                            [ 16:9 walkthrough ]
                        </div>
                    </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    {listing.isVacantLand && (
                        <span className="font-mono text-[10px] font-bold uppercase px-[7px] py-1 bg-org text-[#1a0904]">Land</span>
                    )}
                    {listing.floodZone && (
                        <span className="font-mono text-[10px] font-bold uppercase px-[7px] py-1 bg-blue text-white">Zone {listing.floodZone}</span>
                    )}
                    {listing.isNew && (
                        <span className="font-mono text-[10px] font-bold uppercase px-[7px] py-1 bg-lime text-bg">New</span>
                    )}
                </div>

                {/* Mute toggle (only meaningful with video) */}
                {listing.videoUrl && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="absolute top-3 right-3 bg-black/40 p-2 text-white hover:bg-black/60 transition-all z-20"
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                )}

                {/* Play button */}
                <div className="absolute right-3 bottom-3 w-10 h-10 bg-lime grid place-items-center">
                    {isPlaying
                        ? <Pause size={14} className="text-bg fill-bg" />
                        : <Play size={14} className="text-bg fill-bg ml-0.5" />}
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2.5">
                    <div>
                        <h4 className="text-[15px] font-extrabold uppercase tracking-[-0.01em] truncate">{listing.title}</h4>
                        <div className="font-mono text-[10px] text-mut mt-[3px]">◎ {listing.location}</div>
                    </div>
                    <div className="text-[22px] font-black tracking-[-0.02em] whitespace-nowrap">{formatPrice(listing.price)}</div>
                </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 border-t border-line">
                <div className="p-2.5 border-r border-line">
                    <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-mut2">Zoning</div>
                    <div className="text-[13px] font-extrabold">{listing.zoning || '—'}</div>
                </div>
                <div className="p-2.5 border-r border-line">
                    <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-mut2">Size</div>
                    <div className="text-[13px] font-extrabold">{listing.size || '—'}</div>
                </div>
                <div className="p-2.5">
                    <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-mut2">Schools</div>
                    <div className="text-[13px] font-extrabold">{listing.schoolRating ? `${listing.schoolRating}/10` : '—'}</div>
                </div>
            </div>
        </div>
    );
}
