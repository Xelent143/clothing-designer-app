import React from 'react';
import { MessageCircle, Twitter, Linkedin, Instagram, ArrowUp } from 'lucide-react';

export const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative bg-brand-darker pt-20 pb-10 border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <img src="/images/logo-brand.png" alt="Ayzelify" className="h-10 mb-4 object-contain" />
                        <p className="text-gray-400 max-w-sm">
                            The ultimate AI-powered design studio for exporters and global brands. Revolutionize your workflow today.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">Showcase</a></li>
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-brand-cyan transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
                    <p className="text-gray-500 text-sm">© 2026 ayzelify. All rights reserved.</p>

                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/923022922242?text=i%20am%20intrested%20in%20Ayzelify%20Ai%20app%20%2C%20please%20provide%20me%20more%20details%20on%20how%20to%20buy."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform active:scale-90 flex items-center justify-center"
            >
                <MessageCircle size={28} fill="white" />
            </a>
        </footer>
    );
};
