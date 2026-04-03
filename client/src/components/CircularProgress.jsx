import React from 'react';

const CircularProgress = ({ percentage = 0, color, label, value }) => {
  // Ensure percentage is a valid number
  const validPercentage = !isNaN(percentage) && isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Glowing Background Effect */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse-glow ${color}`}></div>
        
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full border-2 opacity-30 ${color} blur-sm`}></div>
        
        {/* SVG Circle */}
        <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-lg">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background Circle */}
          <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
          
          {/* Progress Circle with Glow */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#glow)"
            className={`transition-all duration-1000 ease-out ${color}`}
            style={{
              filter: `drop-shadow(0 0 8px currentColor)`,
              textShadow: 'none'
            }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center z-20">
          <span className="text-2xl font-bold text-white tracking-tighter drop-shadow-lg">{value}</span>
        </div>
      </div>
      
      <span className="mt-4 text-xs tracking-wider uppercase text-white/40 font-semibold">{label}</span>
    </div>
  );
};

export default CircularProgress;
