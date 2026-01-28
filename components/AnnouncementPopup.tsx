import React, { useEffect, useState } from 'react';
import { announcementService, Announcement } from '../services/announcementService';
import { Button } from './Button';

export const AnnouncementPopup: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkAnnouncement = async () => {
            try {
                console.log('[AnnouncementPopup] Checking for announcements...');
                const latest = await announcementService.getLatestAnnouncement();
                console.log('[AnnouncementPopup] Latest announcement:', latest);

                if (latest) {
                    const lastSeenId = localStorage.getItem('last_seen_announcement');
                    console.log('[AnnouncementPopup] Last seen ID:', lastSeenId);
                    console.log('[AnnouncementPopup] Latest ID:', latest.id);

                    if (lastSeenId !== latest.id) {
                        console.log('[AnnouncementPopup] Showing popup!');
                        setAnnouncement(latest);
                        setIsOpen(true);
                    } else {
                        console.log('[AnnouncementPopup] Already seen, skipping');
                    }
                } else {
                    console.log('[AnnouncementPopup] No active announcements found');
                }
            } catch (e) {
                console.error("[AnnouncementPopup] Failed to check announcements:", e);
            }
        };

        checkAnnouncement();
    }, []);

    const handleAcknowledge = () => {
        if (announcement) {
            localStorage.setItem('last_seen_announcement', announcement.id);
            setIsOpen(false);
        }
    };

    if (!isOpen || !announcement) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-neutral-900 border border-cyan-500/50 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold brand-font text-white uppercase tracking-wider text-center">
                        {announcement.title || "Details"}
                    </h3>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {announcement.image_url && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
                            <img src={announcement.image_url} alt="Announcement" className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {announcement.message}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20">
                    <Button onClick={handleAcknowledge} className="w-full py-4 text-sm font-bold uppercase tracking-widest bg-cyan-600 hover:bg-cyan-500 glow-cyan">
                        Acknowledge
                    </Button>
                </div>
            </div>
        </div>
    );
};
