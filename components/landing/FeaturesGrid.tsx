import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Camera, Ghost, Share2, FileText, Users, PenTool } from 'lucide-react';

const features = [
    {
        title: "Apparel Master",
        description: "Generate product images from all angles (Alibaba/Website ready)",
        icon: Shirt,
        className: "md:col-span-2 lg:col-span-2 row-span-2",
    },
    {
        title: "AI Photoshoot",
        description: "Turn raw mannequin shots into realistic model photoshoots",
        icon: Camera,
        className: "md:col-span-1 row-span-1",
    },
    {
        title: "Ghost Mannequin",
        description: "Auto-generate professional ghost mannequin effects",
        icon: Ghost,
        className: "md:col-span-1 row-span-1",
    },
    {
        title: "Marketing Hub",
        description: "Create banners & social content with SEO captions",
        icon: Share2,
        className: "md:col-span-2 lg:col-span-1 row-span-2",
    },
    {
        title: "Tech Pack Generator",
        description: "Instant tech packs from chat & raw info",
        icon: FileText,
        className: "md:col-span-1",
    },
    {
        title: "Client Suite",
        description: "CRM, Invoices, Quotes & Portfolio",
        icon: Users,
        className: "md:col-span-1",
    },
    {
        title: "Rebranding Hub",
        description: "Swap logos and rebrand products instantly",
        icon: PenTool,
        className: "md:col-span-2",
    },
];

const MagneticCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);
        setPosition({ x: x * 0.1, y: y * 0.1 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const FeaturesGrid = () => {
    return (
        <section className="py-24 relative bg-brand-darker/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        Everything You Need <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
                            In One Studio
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                    {features.map((feature, idx) => (
                        <MagneticCard key={idx} className={`relative group ${feature.className}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl backdrop-blur-md border border-white/10 group-hover:border-brand-cyan/50 transition-colors duration-500 overflow-hidden">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-cyan to-transparent transition-opacity duration-500" />

                                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                                    <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-brand-cyan group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon size={24} />
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </MagneticCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
