import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { updateProfileBranding } from '../services/profileService';

export const BrandingSettings: React.FC = () => {
    const { user, profile, refreshProfile } = useAuth();
    const [companyName, setCompanyName] = useState(profile?.branding?.companyName || '');
    const [brandingEnabled, setBrandingEnabled] = useState(profile?.branding?.enabled || false);
    const [logoPreview, setLogoPreview] = useState<string | null>(profile?.branding?.logoBase64 || null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user || !profile) return;
        setSaving(true);
        try {
            await updateProfileBranding(user.id, {
                companyName,
                enabled: brandingEnabled,
                logoBase64: logoPreview || undefined
            });
            await refreshProfile();
            alert('Branding settings saved successfully!');
        } catch (error) {
            console.error('Error saving branding settings:', error);
            alert('Failed to save branding settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400">Custom Branding</h3>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wide">Enable Custom Branding</p>
                    <p className="text-[10px] text-gray-400 uppercase">Apply your logo/name to all AI designs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={brandingEnabled}
                        onChange={(e) => setBrandingEnabled(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 height-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <style dangerouslySetInnerHTML={{ __html: '.height-6 { height: 1.5rem; }' }} />
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Company / Brand Name</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. XELENT WEAR"
                        className="w-full bg-black border border-white/20 p-3 text-sm focus:border-blue-500 outline-none transition-all text-white"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Brand Logo</label>
                    <div className="flex items-start gap-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 bg-black border border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all p-2 group"
                        >
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-blue-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                    <span className="text-[8px] text-gray-600 uppercase mt-2 group-hover:text-blue-400 text-center">Upload Logo</span>
                                </>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-[10px] text-gray-500 uppercase leading-relaxed">
                                Upload a transparent PNG or SVG logo for best results. This will be creatively integrated onto your garments by our AI.
                            </p>
                            {logoPreview && (
                                <button
                                    onClick={() => setLogoPreview(null)}
                                    className="text-[10px] text-red-400 uppercase hover:underline"
                                >
                                    Remove Logo
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                <Button fullWidth onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Branding Profile'}
                </Button>
            </div>
        </div>
    );
};
