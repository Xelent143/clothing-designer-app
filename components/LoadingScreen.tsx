import React from 'react';

interface LoadingScreenProps {
  message: string;
  subMessage?: string;
  progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, subMessage, progress = 0 }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-lg px-8">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
           <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white brand-font uppercase animate-pulse">
             {message}
           </h2>
           <div className="h-6">
             {subMessage && (
               <p className="text-purple-400 font-mono text-xs md:text-sm uppercase tracking-widest">
                 {subMessage}<span className="animate-blink">_</span>
               </p>
             )}
           </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4 border border-white/10">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-700 via-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
        
        {/* Percentage & Stats */}
        <div className="flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
           <span>System Status: Processing</span>
           <span className="text-white font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};