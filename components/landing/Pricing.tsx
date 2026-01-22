import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const plans = [
    {
        name: "Starter",
        priceUSD: "55",
        pricePKR: "15,000",
        generations: "100",
        features: ["Basic Access", "Standard Support", "Export to PDF"],
        cta: "Get Started",
        popular: false
    },
    {
        name: "Professional",
        priceUSD: "90",
        pricePKR: "25,000",
        generations: "200",
        features: ["Priority Access", "Priority Support", "All Formats", " Commercial License"],
        cta: "Go Pro",
        popular: false
    },
    {
        name: "Business",
        priceUSD: "125",
        pricePKR: "35,000",
        generations: "400",
        features: ["Team Access", "24/7 Support", "API Access", "Custom Branding"],
        cta: "Choose Business",
        popular: true
    },
    {
        name: "Enterprise",
        priceUSD: "180",
        pricePKR: "50,000",
        generations: "1000",
        features: ["Unlimited Access", "Dedicated Manager", "Custom Solutions", "SLA"],
        cta: "Contact Sales",
        popular: false
    }
];

export const Pricing = () => {
    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold font-display">Simple, Transparent Pricing</h2>
                    <p className="text-gray-400">Choose the perfect plan for your business needs</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={twMerge(
                                "relative p-6 rounded-2xl glass-panel flex flex-col",
                                plan.popular && "border-brand-cyan/50 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-cyan text-brand-darker text-sm font-bold rounded-full animate-pulse-slow">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-200 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${plan.priceUSD}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">approx. PKR {plan.pricePKR}</div>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                <div className="flex items-center gap-2 text-brand-cyan">
                                    <span className="font-bold">{plan.generations}</span>
                                    <span className="text-gray-300">Generations</span>
                                </div>
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                                        <Check className="w-4 h-4 text-brand-cyan" />
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button className={twMerge(
                                "w-full py-3 rounded-xl font-semibold transition-all duration-300",
                                plan.popular
                                    ? "bg-brand-cyan text-brand-darker hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                                    : "bg-white/10 hover:bg-white/20 text-white"
                            )}>
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
