import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { ArrowRight, Sparkles, Box, Camera, FileText, Zap } from 'lucide-react';

export const Hero = ({ onStart }: { onStart: () => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref });
    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 bg-brand-dark overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />

                {/* Moving Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                {/* Brand Logo */}
                <div className="absolute top-6 left-6 md:left-12 z-50">
                    <img src="/images/logo-brand.png" alt="Ayzelify" className="h-12 w-auto object-contain" />
                </div>
            </div>

            <div className="relative container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(0,229,255,0.1)] cursor-pointer group hover:bg-white/10 transition-colors"
                        onClick={() => window.open('https://www.sialkotaimasters.com/', '_blank')}
                    >
                        <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                        <span className="text-sm text-gray-300 tracking-wide uppercase font-semibold text-[10px] md:text-xs group-hover:text-white transition-colors">A project By Sialkot Ai Masters</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight font-display tracking-tight">
                        Revolutionize Your <br />
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-purple neon-text-cyan">
                                Export Business
                            </span>
                            <motion.span
                                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-transparent"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1, duration: 1 }}
                            />
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                        Generate professional <span className="text-brand-cyan">product shoots</span>, detailed <span className="text-brand-purple">tech packs</span>, and marketing assets in seconds.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 229, 255, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onStart}
                            className="group relative px-8 py-4 bg-brand-cyan text-brand-darker font-bold rounded-lg overflow-hidden transition-all"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative z-10 flex items-center gap-2">
                                Members Login
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open('https://youtu.be/6wIgS8drVeE?si=NPC_QhMWXqeHE7s-', '_blank')}
                            className="px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-lg hover:border-white/40 transition-colors flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5 text-brand-purple" />
                            View Demo
                        </motion.button>
                    </div>

                    <div className="pt-8 flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border border-brand-dark bg-gray-800 flex items-center justify-center text-xs text-white">
                                    {/* Placeholder avatars */}
                                    <div className={`w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900`} />
                                </div>
                            ))}
                        </div>
                        <p>Trusted by <span className="text-white font-medium">2,000+</span> manufacturing brands</p>
                    </div>
                </motion.div>

                {/* 3D Dashboard Mockup Area */}
                <div className="relative h-[600px] w-full flex items-center justify-center perspective-1000">
                    <DashboardMockup mouseX={mouseX} mouseY={mouseY} />
                </div>
            </div>
        </section>
    );
};

const DashboardMockup = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => {
    // Parallax transforms
    const rotateX = useTransform(mouseY, [-1, 1], [10, -10]);
    const rotateY = useTransform(mouseX, [-1, 1], [-10, 10]);
    const moveX = useTransform(mouseX, [-1, 1], [-20, 20]);
    const moveY = useTransform(mouseY, [-1, 1], [-20, 20]);

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                x: moveX,
                y: moveY,
                transformStyle: "preserve-3d"
            }}
            className="relative w-full max-w-lg aspect-[4/3]"
        >
            {/* Main Panel */}
            <div className="absolute inset-0 glass-panel rounded-2xl border border-brand-cyan/20 bg-brand-dark/40 shadow-2xl overflow-hidden backdrop-blur-xl transform-style-3d">
                {/* Header */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-white/5">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-20 h-2 rounded-full bg-white/10" />
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 relative h-[calc(100%-3rem)] flex flex-col items-center justify-center">

                    {/* Scanning Line Animation */}
                    <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-brand-cyan/50 shadow-[0_0_15px_rgba(0,229,255,0.5)] z-0"
                    />

                    {/* Central Hub */}
                    <div className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center bg-brand-dark/80 border border-brand-cyan/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                        <div className="absolute inset-0 rounded-full border border-brand-cyan/20 animate-spin-slow" style={{ animationDuration: '10s' }} />
                        <div className="absolute inset-2 rounded-full border border-dashed border-brand-purple/40 animate-spin-slow-reverse" style={{ animationDuration: '15s' }} />
                        <Sparkles className="w-12 h-12 text-brand-cyan animate-pulse" />
                    </div>

                    <div className="mt-6 text-center space-y-2 z-10">
                        <div className="text-xl font-bold text-white">AI Processing</div>
                        <div className="flex gap-1 justify-center">
                            <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Cards (Pop-out elements) */}
            <FloatingCard
                icon={<Camera className="w-6 h-6 text-brand-cyan" />}
                label="Photoshoot"
                position="top-20 -left-12"
                delay={0}
                xMotion={-20}
            />

            <FloatingCard
                icon={<FileText className="w-6 h-6 text-brand-purple" />}
                label="Tech Pack"
                position="bottom-32 -right-12"
                delay={0.5}
                xMotion={20}
            />

            <FloatingCard
                icon={<Box className="w-6 h-6 text-emerald-400" />}
                label="3D Model"
                position="bottom-10 left-10"
                delay={1}
                xMotion={-10}
            />

        </motion.div>
    );
};

const FloatingCard = ({ icon, label, position, delay, xMotion }: any) => {
    return (
        <motion.div
            animate={{
                y: [0, -15, 0],
                x: [0, xMotion / 2, 0]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            className={`absolute ${position} p-4 rounded-xl glass-panel border border-white/10 flex items-center gap-3 shadow-xl z-20`}
            style={{ transform: "translateZ(50px)" }} // Push forward in 3D space
        >
            <div className="p-2 rounded-lg bg-white/5">
                {icon}
            </div>
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Generated</div>
                <div className="text-sm font-bold text-white">{label}</div>
            </div>
        </motion.div>
    )
}
