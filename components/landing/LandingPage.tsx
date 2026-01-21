import React from 'react';
import { Hero } from './Hero';
import { StudioGrid } from './StudioGrid';
import { InteractiveDemo } from './InteractiveDemo';
import { Pricing } from './Pricing';
import { Footer } from './Footer';

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
    return (
        <div className="bg-brand-dark min-h-screen text-white overflow-hidden selection:bg-brand-cyan selection:text-brand-darker">
            <Hero onStart={onStart} />
            <StudioGrid />
            <InteractiveDemo />
            <Pricing />
            <Footer />
        </div>
    );
};
