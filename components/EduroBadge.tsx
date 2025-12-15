import React from 'react';

export const EduroBadge: React.FC = () => (
  <svg viewBox="0 0 200 240" className="w-full h-full">
    {/* Grouping for positioning */}
    <g transform="translate(0, 0)">
      
      {/* 1. Elf Legs (Bottom Layer) */}
      <g transform="translate(60, 185)">
         {/* Left Leg */}
         <path d="M15 0 L15 25 Q0 30 5 45 L35 45 Q40 30 25 25 L25 0 Z" fill="#2e7d32" /> {/* Green Tights */}
         <path d="M15 25 L5 32 L15 32 L20 38 L25 32 L35 32 L25 25 Z" fill="#c0392b" /> {/* Red Frill */}
         <path d="M5 45 Q-5 55 15 55 L25 45 Z" fill="#2e7d32" /> {/* Shoe */}
         <circle cx="5" cy="45" r="3" fill="#f1c40f" /> {/* Bell */}

         {/* Right Leg */}
         <path d="M65 0 L65 25 Q50 30 55 45 L85 45 Q90 30 75 25 L75 0 Z" fill="#2e7d32" />
         <path d="M65 25 L55 32 L65 32 L70 38 L75 32 L85 32 L75 25 Z" fill="#c0392b" />
         <path d="M55 45 Q45 55 65 55 L75 45 Z" fill="#2e7d32" />
         <circle cx="55" cy="45" r="3" fill="#f1c40f" />
      </g>

      {/* 2. Main Blue Circle */}
      <circle cx="100" cy="100" r="95" fill="#1e3a8a" stroke="#fff" strokeWidth="2" /> {/* Nordic Dark Blue */}
      
      {/* 3. Inner White Circle */}
      <circle cx="100" cy="110" r="75" fill="white" />

      {/* 4. EDURO Logo (Top Left) */}
      <text x="50" y="45" fontFamily="sans-serif" fontSize="22" fill="white" fontWeight="bold" transform="rotate(-15 50 45)">EDURO</text>
      {/* Leaf accent for Eduro logo */}
      <path d="M75 25 Q80 15 90 20 Q85 35 75 25 Z" fill="white" transform="rotate(-15 75 25)"/>

      {/* 5. Christmas Tree (Center) */}
      <g transform="translate(65, 55) scale(0.7)">
         <path d="M50 0 L90 40 L70 40 L100 80 L0 80 L30 40 L10 40 Z" fill="#374151" /> {/* Dark Grey Tree */}
         <rect x="40" y="80" width="20" height="15" fill="#374151" />
         {/* Ornaments (White outlines/balls) */}
         <circle cx="50" cy="0" r="6" fill="#374151" /> {/* Star/Top */}
         <circle cx="30" cy="60" r="4" fill="white" />
         <circle cx="70" cy="60" r="4" fill="white" />
         <circle cx="50" cy="30" r="4" fill="white" />
         {/* Garland strings */}
         <path d="M25 50 Q50 65 75 50" fill="none" stroke="white" strokeWidth="2" />
      </g>

      {/* 6. Text: JOULU-OSAAJA */}
      <text x="100" y="145" fontFamily="sans-serif" fontSize="16" fill="#374151" textAnchor="middle" fontWeight="900" letterSpacing="1">JOULU-</text>
      <text x="100" y="165" fontFamily="sans-serif" fontSize="18" fill="#374151" textAnchor="middle" fontWeight="900" letterSpacing="1">OSAAJA</text>

      {/* 7. Santa Hat (Top Right) */}
      <g transform="translate(130, -10) rotate(15)">
        <path d="M0 50 Q20 -10 70 40 L60 70 Q20 50 0 50 Z" fill="#c0392b" />
        <circle cx="70" cy="40" r="12" fill="white" />
        <path d="M-10 50 Q30 40 70 60 L60 80 Q20 60 -10 65 Z" fill="white" />
      </g>

      {/* 8. Belt/Rim Decoration (Bottom of blue circle) */}
      <path d="M25 100 A 95 95 0 0 0 175 100" fill="none" stroke="none" /> 
      {/* Green belt mimic */}
      <path d="M30 145 Q100 185 170 145" fill="none" stroke="#27ae60" strokeWidth="12" strokeLinecap="round" opacity="0.9" />
      <rect x="85" y="158" width="30" height="20" rx="4" fill="#f1c40f" stroke="#c0392b" strokeWidth="2" /> {/* Buckle */}

    </g>
  </svg>
);