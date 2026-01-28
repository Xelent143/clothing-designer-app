import React from 'react';

const PRIVACY_TEXT = "PRIVACY NOTICE: All images uploaded to this platform are processed securely solely for the purpose of quality monitoring and AI model enhancement. Your data remains strictly confidential and will NOT be used for any commercial purposes or shared with third parties. By using this service, you acknowledge and agree to these terms.";

// Repeat the text to ensure smooth looping
const REPEATED_TEXT = `${PRIVACY_TEXT} • ${PRIVACY_TEXT} • ${PRIVACY_TEXT} • ${PRIVACY_TEXT} • `;

export const PrivacyBanner: React.FC = () => {
    return (
        <div className="w-full bg-slate-900 border-b border-white/10 overflow-hidden relative z-50 h-8 flex items-center">
            {/* Gradient overlays to fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10" />

            <div className="whitespace-nowrap animate-marquee flex items-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-500/80 px-4">
                    {REPEATED_TEXT}
                </span>
                {/* Duplicate content for seamless loop effect (handled by repeating text above, but structure supports it) */}
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-500/80 px-4">
                    {REPEATED_TEXT}
                </span>
            </div>
        </div>
    );
};
