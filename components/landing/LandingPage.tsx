import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from './Hero';
import { StudioGrid } from './StudioGrid';
import { InteractiveDemo } from './InteractiveDemo';
import { Pricing } from './Pricing';
import { Footer } from './Footer';

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');
    };

    return (
        <div className="bg-brand-dark min-h-screen text-white overflow-hidden selection:bg-brand-cyan selection:text-brand-darker">
            <Hero onStart={handleStart} />
            <StudioGrid />
            <InteractiveDemo />
            <Pricing />
            <Footer />
        </div>
    );
};
