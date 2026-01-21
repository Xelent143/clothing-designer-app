
import React from 'react';
import { CHANGELOG_HISTORY, ChangelogItem } from '../types';

interface ChangelogModalProps {
    onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
    // Only show the latest 2 versions to keep it clean, or all if needed.
    // For now, let's show the latest one prominently and recent history.
    const latestInfo = CHANGELOG_HISTORY[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden animate-slide-up">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="p-8 relative">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                System <span className="text-cyan-400">Update</span>
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/20">
                                    v{latestInfo.version}
                                </span>
                                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                                    {latestInfo.date}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-cyan-100 text-sm font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">
                                {latestInfo.title}
                            </h3>
                            <ul className="space-y-3">
                                {latestInfo.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-[10px] text-slate-500 text-center">
                                Enjoy the new capabilities. Azelify System Core is now optimized for higher precision.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase py-3 rounded-xl tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};
