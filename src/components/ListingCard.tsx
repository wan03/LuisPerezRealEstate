'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, MapPin, Ruler, Home as HomeIcon, School, Waves, FileText, Volume2, VolumeX } from 'lucide-react';

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

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transition-all hover:shadow-2xl group">
            {/* Video Container */}
            <div className="relative aspect-[9/16] bg-black cursor-pointer overflow-hidden" onClick={togglePlay}>
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white/20">
                        <HomeIcon size={64} />
                    </div>
                )}

                {/* Play/Pause Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30">
                        {isPlaying ? <Pause className="text-white fill-white" /> : <Play className="text-white fill-white ml-1" />}
                    </div>
                </div>

                {/* Mute Toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/20 text-white hover:bg-white/20 transition-all z-20"
                >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                {/* Info Overlays */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {listing.isVacantLand && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Ruler size={12} /> VACANT LAND
                        </span>
                    )}
                    {listing.floodZone && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Waves size={12} /> ZONE {listing.floodZone}
                        </span>
                    )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-md">
                    <h3 className="text-xl font-bold truncate">{listing.title}</h3>
                    <p className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin size={14} /> {listing.location}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-slate-900">${listing.price.toLocaleString()}</span>
                    <button className="text-indigo-600 font-semibold text-sm hover:underline">View Roadmap</button>
                </div>

                {/* Features / Zoning */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                    {listing.zoning && (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <FileText size={16} className="text-slate-400" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Zoning</p>
                                <p className="text-xs font-bold text-slate-700">{listing.zoning}</p>
                            </div>
                        </div>
                    )}
                    {listing.schoolRating && (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <School size={16} className="text-slate-400" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Schools</p>
                                <p className="text-xs font-bold text-slate-700">{listing.schoolRating}/10 Rating</p>
                            </div>
                        </div>
                    )}
                </div>

                <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl transition-all hover:bg-slate-800 active:scale-[0.98]">
                    Contact Team
                </button>
            </div>
        </div>
    );
}
