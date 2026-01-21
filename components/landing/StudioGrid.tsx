import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Shirt, FileText, Zap, Users, Share2, Layers } from 'lucide-react';

export const StudioGrid = () => {
    return (
        <section className="py-24 bg-brand-dark overflow-hidden relative">
            <div className="container mx-auto px-4 z-10 relative">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        Everything You Need <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">
                            In One Studio
                        </span>
                    </h2>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] max-w-7xl mx-auto">

                    {/* 1. Apparel Master - Big Feature Card (2x2) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 md:row-span-2 rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group relative hover:border-brand-cyan/50 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/images/grid-apparel.png"
                            alt="Apparel Master Interface"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-6 left-6 z-10">
                            <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center mb-3 backdrop-blur-md border border-brand-cyan/30">
                                <Shirt className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">Apparel Master</h3>
                            <p className="text-gray-400 text-sm max-w-[200px]">Generate product images from all angles (Alibaba/Website ready)</p>
                        </div>
                    </motion.div>

                    {/* 2. AI Photoshoot */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 md:row-span-1 rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group relative hover:border-brand-purple/50 transition-colors min-h-[200px]"
                    >
                        {/* Placeholder/Abstract visuals for photoshoot */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-purple/20 blur-3xl" />

                        <div className="absolute inset-6">
                            <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center mb-3 backdrop-blur-md border border-brand-purple/30">
                                <Camera className="w-5 h-5 text-brand-purple" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">AI Photoshoot</h3>
                            <p className="text-gray-400 text-xs">Turn raw mannequin shots into realistic model photoshoots</p>
                        </div>
                    </motion.div>

                    {/* 3. Ghost Mannequin */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 md:row-span-1 rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group relative hover:border-brand-cyan/50 transition-colors min-h-[200px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/5 to-transparent" />

                        <div className="absolute inset-6">
                            <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center mb-3 backdrop-blur-md border border-brand-cyan/30">
                                <Layers className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Ghost Mannequin</h3>
                            <p className="text-gray-400 text-xs">Auto-generate professional ghost mannequin effects</p>
                        </div>
                    </motion.div>

                    {/* 4. Marketing Hub - Tall Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 md:row-span-2 rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group relative hover:border-pink-500/50 transition-colors"
                    >
                        <img
                            src="/images/grid-marketing.png"
                            alt="Marketing Dashboard"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />

                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mb-3 backdrop-blur-md border border-pink-500/30">
                                <Share2 className="w-5 h-5 text-pink-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Marketing Hub</h3>
                            <p className="text-gray-400 text-xs">Create banners & social content with SEO captions</p>
                        </div>
                    </motion.div>

                    {/* 5. Tech Pack Generator */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 md:row-span-1 rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group relative hover:border-blue-400/50 transition-colors"
                    >
                        <img
                            src="/images/grid-techpack.png"
                            alt="Tech Pack"
                            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-6 z-10">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 backdrop-blur-md border border-blue-500/30">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Tech Pack</h3>
                            <p className="text-gray-400 text-xs">Instant tech packs from chat & raw info</p>
                        </div>
                    </motion.div>

                    {/* 6. Client Suite */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 lg:col-span-2 rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden group relative hover:border-green-400/50 transition-colors p-6 flex flex-col md:flex-row items-center gap-6"
                    >
                        <div className="flex-1">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3 backdrop-blur-md border border-green-500/30">
                                <Users className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Client Suite</h3>
                            <p className="text-gray-400 text-sm">Manage clients, approvals, and deliveries in one secure portal.</p>
                        </div>
                        {/* Mini UI Mockup for Client Suite */}
                        <div className="w-full md:w-1/2 h-24 bg-neutral-800/80 rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
                            <div className="text-xs text-green-400 font-mono">STATUS: PROJECT APPROVED</div>
                            <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
