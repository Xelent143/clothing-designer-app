import React from 'react';
import { AppMode, AppStep } from '../types';

interface SidebarProps {
    currentMode: AppMode;
    setMode: (mode: AppMode) => void;
    reset: (mode: AppMode) => void;
    userEmail?: string;
    isAdmin?: boolean;
    onSettings: () => void;
    onAdmin: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentMode,
    setMode,
    reset,
    userEmail,
    isAdmin,
    onSettings,
    onAdmin,
    isOpen,
    onClose
}) => {
    const navItems = [
        { mode: 'designer' as AppMode, label: 'Collection Studio', icon: '🎨' },
        { mode: 'rebranding' as AppMode, label: 'Rebranding Hub', icon: '🔄' },
        { mode: 'social_studio' as AppMode, label: 'Social Studio', icon: '📱' },
        { mode: 'ghost' as AppMode, label: 'Ghost Mannequin', icon: '👕' },
        { mode: 'banner' as AppMode, label: 'Marketing Banners', icon: '🛰️' },
        { mode: 'photoshoot' as AppMode, label: 'AI Photoshoot', icon: '📸' },
        { mode: 'master' as AppMode, label: 'Apparel Master', icon: '👔' },
        { mode: 'techpack_generator' as AppMode, label: 'Tech Pack Generator', icon: '📋' },
    ];

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex`}>
                <div className="p-8 flex justify-between items-center">
                    <div>
                        <img src="/images/logo-brand.png" alt="Ayzelify" className="h-10 mb-2 object-contain" />
                        <a
                            href="https://www.sialkotaimasters.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 hover:text-brand-cyan transition-colors block"
                        >
                            A PROJECT BY SIALKOT AI MASTERS
                        </a>
                    </div>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">✕</button>
                </div>

                <nav className="flex-grow px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.mode}
                            onClick={() => { setMode(item.mode); reset(item.mode); onClose(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${currentMode === item.mode
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-4">
                    {userEmail && (
                        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Signed in as</p>
                            <p className="text-xs text-white truncate font-mono">{userEmail}</p>
                        </div>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => { onAdmin(); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-purple-400 hover:text-purple-300 transition-all text-sm font-semibold border border-purple-500/20 bg-purple-500/5 rounded-xl"
                        >
                            <span>🔐</span>
                            Admin Panel
                        </button>
                    )}

                    <button
                        onClick={() => { onSettings(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-all text-sm font-semibold"
                    >
                        <span>⚙️</span>
                        Settings
                    </button>
                </div>
            </aside>
        </>
    );
};
