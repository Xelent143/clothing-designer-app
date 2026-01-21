
import React, { useState, useRef } from 'react';
import { SOCIAL_PLATFORMS, SocialPlatform } from '../types';
import { Button } from './Button';
import { generateSocialPost } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { uploadImageToPublicStorage, publishToInstagram, deleteImageFromStorage } from '../services/socialService';
import { incrementGenerations } from '../services/profileService';

interface SocialMediaStudioProps {
    onBack: () => void;
}

export const SocialMediaStudio: React.FC<SocialMediaStudioProps> = ({ onBack }) => {
    const { profile } = useAuth();
    const [image, setImage] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Instagram');
    const [generatedPost, setGeneratedPost] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image) return;
        setLoading(true);
        setGeneratedPost("");
        try {
            const result = await generateSocialPost(image, selectedPlatform, profile?.branding?.companyName || "Azelify", profile?.api_keys?.gemini);
            setGeneratedPost(result);
            if (profile?.id) {
                await incrementGenerations(profile.id, 1);
            }
        } catch (error: any) {
            alert("Error generating post: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePostNow = async () => {
        if (!image || !generatedPost) return;
        if (selectedPlatform !== 'Instagram') {
            alert("Direct posting is currently only supported for Instagram.");
            return;
        }

        const token = profile?.api_keys?.instagram_token;
        const userId = profile?.api_keys?.instagram_user_id;

        if (!token || !userId) {
            alert("Instagram Access Token or User ID missing. Please configure them in Settings.");
            return;
        }

        setPosting(true);
        let uploadedUrl = "";
        try {
            // 1. Upload to public storage (placeholder/supabase)
            uploadedUrl = await uploadImageToPublicStorage(image, profile.uid);

            // 2. Publish
            const startIdx = generatedPost.indexOf("BODY:");
            const caption = startIdx > -1 ? generatedPost.substring(startIdx).replace("BODY:", "").trim() : generatedPost;

            await publishToInstagram(uploadedUrl, caption, token, userId);
            alert("Successfully posted to Instagram!");
        } catch (error: any) {
            console.error("Posting Error", error);
            alert("Failed to post: " + error.message);
        } finally {
            // 3. Cleanup to save space
            if (uploadedUrl) {
                await deleteImageFromStorage(uploadedUrl);
            }
            setPosting(false);
        }
    };

    const handleCopy = () => {
        if (generatedPost) {
            navigator.clipboard.writeText(generatedPost);
            alert("Post copied to clipboard!");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full animate-fade-in p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold brand-font uppercase tracking-tighter glow-text">
                        Social <span className="text-cyan-400">Studio</span>
                    </h2>
                    <p className="text-cyan-500/40 text-[10px] uppercase tracking-[0.4em] font-black">AI Content Generator</p>
                </div>
                <Button variant="outline" onClick={onBack}>
                    Back to Hub
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-full">
                {/* Left Column: Image Upload */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-grow border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer relative overflow-hidden group ${image ? 'border-cyan-500/50 bg-slate-900/50' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/5'
                            }`}
                        style={{ minHeight: '400px' }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        {image ? (
                            <img src={image} alt="Upload" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center group-hover:scale-105 transition-transform">
                                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest text-cyan-100 mb-2">Upload Product Image</p>
                                <p className="text-[10px] text-cyan-500/60 uppercase">Supports JPG, PNG, WEBP</p>
                            </div>
                        )}

                        {image && (
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">Click to Change</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Controls & Output */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    {/* Platform Selector */}
                    <div className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4">Select Platform</h3>
                        <div className="flex flex-wrap gap-3">
                            {SOCIAL_PLATFORMS.map((platform) => (
                                <button
                                    key={platform}
                                    onClick={() => setSelectedPlatform(platform)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${selectedPlatform === platform
                                        ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {platform}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleGenerate}
                        disabled={!image || loading}
                        size="lg"
                        className={loading ? "animate-pulse" : ""}
                    >
                        {loading ? "Analyzing & Writing..." : `Generate ${selectedPlatform} Post`}
                    </Button>

                    {/* Output Area */}
                    <div className="flex-grow bg-slate-950 border border-white/10 rounded-2xl p-6 relative group overflow-hidden flex flex-col min-h-[300px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-50" />

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {generatedPost ? "AI Generated Content" : "Waiting for input..."}
                            </span>
                            <div className="flex items-center gap-3">
                                {generatedPost && selectedPlatform === 'Instagram' && (
                                    <button
                                        onClick={handlePostNow}
                                        disabled={posting}
                                        className={`text-[10px] font-bold uppercase tracking-widest ${posting ? 'text-slate-500' : 'text-purple-400 hover:text-white'} transition-colors flex items-center gap-1`}
                                    >
                                        {posting ? (
                                            <><span>⏳</span> Posting...</>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                Post to IG
                                            </>
                                        )}
                                    </button>
                                )}
                                {generatedPost && (
                                    <button
                                        onClick={handleCopy}
                                        className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        Copy Text
                                    </button>
                                )}
                            </div>
                        </div>

                        {generatedPost ? (
                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                                <p className="whitespace-pre-wrap font-mono text-sm text-cyan-100/90 leading-relaxed">
                                    {generatedPost}
                                </p>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-slate-700">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest">Select Platform & Generate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
