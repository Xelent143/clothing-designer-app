import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../types';

interface CategoryCarouselProps {
    onSelect: (category: string) => void;
    icons: Record<string, React.FC<{ className?: string }>>;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ onSelect, icons }) => {
    const [rotation, setRotation] = useState(0);
    const radius = 600; // Controlled by CSS translateZ
    const itemCount = CATEGORIES.length;
    const angleStep = 360 / itemCount;

    return (
        <div className="relative w-full h-[500px] perspective-container flex items-center justify-center overflow-visible">
            <div
                className="carousel-3d w-full h-full"
                style={{ transform: `rotateY(${rotation}deg)` }}
            >
                {CATEGORIES.map((cat, idx) => {
                    const Icon = icons[cat];
                    const angle = idx * angleStep;

                    return (
                        <div
                            key={cat}
                            className="carousel-item w-60 h-72 cursor-pointer group"
                            style={{
                                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                            }}
                            onClick={() => onSelect(cat)}
                        >
                            <div className="w-full h-full glass-card rounded-2xl flex flex-col items-center justify-center p-6 border-cyan-500/20 group-hover:border-cyan-400 group-hover:glow-cyan group-hover:-translate-y-4 transition-all duration-500 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
                                {/* Connecting Lines (Optical Illusion) */}
                                <div className="absolute top-1/2 left-full w-40 h-[1px] bg-gradient-to-r from-cyan-500/40 to-transparent -translate-y-1/2 -z-10" />

                                <div className="mb-6 transform group-hover:scale-125 transition-transform duration-500">
                                    {Icon && <Icon className="w-16 h-16 text-cyan-400/60 group-hover:text-cyan-400" />}
                                </div>

                                <h3 className="text-center font-bold text-sm uppercase tracking-[0.3em] text-cyan-100/60 group-hover:text-white mb-2">
                                    {cat}
                                </h3>

                                <div className="w-8 h-[2px] bg-cyan-500/20 group-hover:bg-cyan-400 transition-colors" />

                                {/* Selection Indicator */}
                                <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-4 py-1 rounded-full border border-cyan-400/30 uppercase tracking-widest">
                                        Initialize
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Control Buttons */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-8 z-20">
                <button
                    onClick={() => setRotation(prev => prev + angleStep)}
                    className="p-4 rounded-full border border-cyan-500/20 bg-slate-950/50 text-cyan-400 hover:glow-cyan transition-all"
                >
                    ←
                </button>
                <button
                    onClick={() => setRotation(prev => prev - angleStep)}
                    className="p-4 rounded-full border border-cyan-500/20 bg-slate-950/50 text-cyan-400 hover:glow-cyan transition-all"
                >
                    →
                </button>
            </div>

            {/* Decorative Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-cyan-500/5 rounded-full -z-10 pointer-events-none"
                style={{ transform: 'rotateX(75deg)' }} />
        </div>
    );
};
