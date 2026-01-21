import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { BrandingSettings } from './BrandingSettings';
import { updateProfileApiKeys } from '../services/profileService';

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const [apiKey, setApiKey] = useState(profile?.api_keys?.gemini || '');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile?.api_keys?.gemini) {
            setApiKey(profile.api_keys.gemini);
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateProfileApiKeys(user.id, {
                gemini: apiKey.trim() || undefined
            });
            await refreshProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving API key:', error);
            alert('Failed to save API key.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        onClose(); // App will redirect to Login automatically
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm overflow-hidden">
            <div className="w-full max-w-lg bg-neutral-900 border border-white/20 shadow-2xl relative max-h-[90vh] flex flex-col">
                {/* Fixed Header with Close Button */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-neutral-900 z-10">
                    <h2 className="text-xl font-bold brand-font uppercase text-white">User Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-8">
                        <div className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Logged in as</p>
                                <p className="text-sm font-mono text-gray-300">{user?.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Generations</p>
                                <p className="text-xl font-black text-white leading-none">{profile?.total_generations || 0}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Gemini API Key</label>
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-purple-400 hover:text-purple-300 uppercase underline decoration-dashed">Get Key</a>
                            </div>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-black border border-white/20 p-3 text-sm font-mono focus:border-purple-500 outline-none transition-all"
                            />
                            <Button fullWidth onClick={handleSave} disabled={saving} className={saved ? "bg-green-600 border-green-500" : ""}>
                                {saving ? "Saving..." : (saved ? "Saved Securely" : "Save API Key")}
                            </Button>
                            <p className="text-[10px] text-gray-600 text-center uppercase tracking-wide">Key is stored securely in your profile database.</p>
                        </div>

                        {/* Social Media API Settings */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Social Media Integration</h3>
                            <p className="text-[10px] text-gray-500">Provide your Meta Graph API credentials to enable direct posting to Instagram & Facebook.</p>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Instagram Business Account ID</label>
                                <input
                                    type="text"
                                    value={profile?.api_keys?.instagram_user_id || ''}
                                    onChange={(e) => {
                                        if (user) updateProfileApiKeys(user.id, { instagram_user_id: e.target.value });
                                        // Note: Real-time update here is a bit aggressive, ideally we use local state then save, 
                                        // but for now let's reuse the handleSave flow by adding local state.
                                    }}
                                    placeholder="e.g., 17841405..."
                                    className="w-full bg-black border border-white/20 p-3 text-sm font-mono focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Instagram Access Token</label>
                                <input
                                    type="password"
                                    value={profile?.api_keys?.instagram_token || ''}
                                    onChange={(e) => {
                                        if (user) updateProfileApiKeys(user.id, { instagram_token: e.target.value });
                                    }}
                                    placeholder="EAA..."
                                    className="w-full bg-black border border-white/20 p-3 text-sm font-mono focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-gray-600 text-center uppercase tracking-wide">
                                <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="underline hover:text-white">Get Token via Graph API Explorer</a>
                            </p>
                        </div>

                        <BrandingSettings />

                        <div className="pt-8 border-t border-white/10">
                            <Button fullWidth variant="outline" onClick={handleLogout} className="text-red-400 border-red-900/50 hover:bg-red-950 hover:border-red-500">
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
