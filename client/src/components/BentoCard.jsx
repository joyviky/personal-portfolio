import React from 'react';

const BentoCard = ({ children, className = "", id }) => (
  <div id={id} className={`relative overflow-hidden bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 hover:bg-[#0f0f13] transition-colors duration-500 group ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

export default BentoCard;
