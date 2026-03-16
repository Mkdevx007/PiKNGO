// PikNGoLogo.jsx
import React from 'react';
import './PikNGoLogo.css';

const PikNGoLogo = () => {
  return (
    <div className="pikngo-logo">
      {/* 3D Pin Icon */}
      <div className="pikngo-pin">
        <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Main Orange Gradient for 3D body */}
            <linearGradient id="pg-3d-orange" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF7043" />
              <stop offset="50%" stopColor="#E64A19" />
              <stop offset="100%" stopColor="#BF360C" />
            </linearGradient>
            
            {/* White/Silver Gradient for metallic feel */}
            <linearGradient id="pg-silver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F5F5F5" />
              <stop offset="100%" stopColor="#E0E0E0" />
            </linearGradient>

            {/* Premium Shine */}
            <linearGradient id="pg-top-shine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id="pg-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 3D Base Shadow (The "Depth") */}
          <path
            d="M54 10 C34 10, 24 24, 24 36 C24 54, 54 82, 54 82 L56 85 C56 85, 86 57, 86 39 C86 27, 76 13, 54 13Z"
            fill="#8B1A06" opacity="0.4" transform="translate(4, 4)"
          />

          {/* Main 3D Orange Body */}
          <path
            d="M50 10 C30 10, 20 24, 20 36 C20 54, 50 82, 50 82 C50 82, 80 54, 80 36 C80 24, 70 10, 50 10Z"
            fill="url(#pg-3d-orange)"
            filter="url(#pg-shadow)"
          />

          {/* Top Shine Layer */}
          <path
            d="M50 10 C30 10, 20 24, 20 36 C20 54, 50 82, 50 82 C50 82, 80 54, 80 36 C80 24, 70 10, 50 10Z"
            fill="url(#pg-top-shine)"
          />

          {/* Inner White Plate - Glassy/Metallic */}
          <circle cx="50" cy="37" r="20" fill="url(#pg-silver)" />
          <circle cx="50" cy="37" r="18" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />

          {/* Orange Fork Details */}
          <rect x="42" y="27" width="2.5" height="20" rx="1.2" fill="#E64A19" />
          <rect x="48.5" y="27" width="2.5" height="20" rx="1.2" fill="#E64A19" />
          <rect x="55" y="27" width="2.5" height="20" rx="1.2" fill="#E64A19" />
          <path d="M42 32 Q50 40 57.5 32" fill="none" stroke="#E64A19" strokeWidth="2.5" strokeLinecap="round" />

          {/* Pin Bottom Shade */}
          <path d="M50 82 L50 92" stroke="#BF360C" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Wordmark - Premium Typography */}
      <div className="pikngo-text">
        <div className="pikngo-brand">
          <span className="pg-main">Pik</span>
          <span className="pg-accent">N</span>
          <span className="pg-main">Go</span>
        </div>
        <div className="pikngo-tagline">Highway Food · Order Ahead</div>
      </div>
    </div>
  );
};

export default PikNGoLogo;
