import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface DemoItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    beforeImage: string;
    afterImage: string;
    beforeLabel: string;
    afterLabel: string;
    icon: string;
}

const demos: DemoItem[] = [
    {
        id: "marketing",
        title: "From Raw to",
        subtitle: "Revenue",
        description: "Turn basic photos into high-conversion marketing assets",
        beforeImage: "/images/denim-raw.jpg",
        afterImage: "/images/denim-marketing.jpg",
        beforeLabel: "Raw Photo",
        afterLabel: "Marketing Asset",
        icon: "/images/icon-marketing.png"
    },
    {
        id: "ghost",
        title: "Instant",
        subtitle: "Ghost Mannequin",
        description: "Remove mannequins automatically for professional catalog shots",
        beforeImage: "/images/jersey-raw.jpg",
        afterImage: "/images/jersey-ghost.jpg",
        beforeLabel: "Raw Photo",
        afterLabel: "Ghost Mannequin",
        icon: "/images/icon-ghost.png"
    },
    {
        id: "model",
        title: "AI Model",
        subtitle: "Photoshoot",
        description: "Visualize your products on diverse AI models instantly",
        beforeImage: "/images/model-before.jpg",
        afterImage: "/images/model-after.jpg",
        beforeLabel: "Mannequin",
        afterLabel: "AI Person",
        icon: "/images/icon-photoshoot.png"
    },
    {
        id: "techpack",
        title: "Automated",
        subtitle: "Tech Packs",
        description: "Generate detailed technical specifications from simple images",
        beforeImage: "/images/techpack-chat.png",
        afterImage: "/images/techpack-pdf.png",
        beforeLabel: "Unorganized Chat",
        afterLabel: "Automated PDF",
        icon: "/images/icon-techpack.png"
    },
    {
        id: "rebranding",
        title: "Rebranding",
        subtitle: "Hub",
        description: "Seamlessly switch branding and identity on existing products",
        beforeImage: "/images/rebrand-before.jpg",
        afterImage: "/images/rebrand-after.jpg",
        beforeLabel: "Original Brand",
        afterLabel: "Rebranded",
        icon: "/images/icon-rebranding.png"
    }
];

const ComparisonSlide = ({ item }: { item: DemoItem }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const clipPath = useTransform(scrollYProgress, [0.3, 0.7], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
    const dividerPosition = useTransform(scrollYProgress, [0.3, 0.7], ["0%", "100%"]);

    return (
        <div ref={containerRef} className="py-12 min-h-[60vh] flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold font-display mb-2">
                    {item.title} <span className="text-brand-cyan">{item.subtitle}</span>
                </h2>
                <p className="text-lg text-gray-400">{item.description}</p>
            </div>

            {/* App Window Container */}
            <div className="relative w-full max-w-5xl mx-auto aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-white/10 group bg-[#0A0A0A] flex flex-col">

                {/* Window Header */}
                <div className="h-12 bg-neutral-900/90 backdrop-blur-md border-b border-white/5 flex items-center px-4 space-x-2 z-20">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    {/* Optional: Title or Empty */}
                    <div className="ml-4 text-xs text-neutral-500 font-mono">azelify-studio.exe</div>
                </div>

                {/* Window Content (The Slider) */}
                <div className="relative flex-1 w-full overflow-hidden">

                    {/* Comparison Icon (Floating) - REMOVED */}{/* "Before" Image (Background) */}

                    {/* "Before" Image (Background) */}
                    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                        <img
                            src={item.beforeImage}
                            alt={item.beforeLabel}
                            className="absolute inset-0 w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        {/* Label Helper (Top Left) */}
                        <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full z-10">
                            <span className="text-gray-300 font-bold text-sm tracking-widest uppercase">{item.beforeLabel}</span>
                        </div>
                    </div>

                    {/* "After" Image (Foreground, revealed by clip-path) */}
                    <motion.div
                        style={{ clipPath }}
                        className="absolute inset-0 bg-brand-dark flex items-center justify-center"
                    >
                        <img
                            src={item.afterImage}
                            alt={item.afterLabel}
                            className="absolute inset-0 w-full h-full object-contain object-center"
                        />
                        {/* Label Helper (Top Right) */}
                        <div className="absolute top-8 right-8 bg-brand-cyan/20 backdrop-blur-md border border-brand-cyan/50 px-4 py-2 rounded-full z-10">
                            <span className="text-brand-cyan font-bold text-sm tracking-widest uppercase">{item.afterLabel}</span>
                        </div>
                    </motion.div>

                    {/* Slider Line */}
                    <motion.div
                        style={{ left: dividerPosition }}
                        className="absolute top-0 bottom-0 w-1 bg-brand-cyan shadow-[0_0_20px_rgba(0,229,255,1)] z-20 flex items-center justify-center pointer-events-none"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-cyan flex items-center justify-center shadow-lg transform -translate-x-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-darker"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export const InteractiveDemo = () => {
    return (
        <section className="relative bg-brand-dark overflow-hidden">
            {demos.map((demo) => (
                <ComparisonSlide key={demo.id} item={demo} />
            ))}
        </section>
    );
};
