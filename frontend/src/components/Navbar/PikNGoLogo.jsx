import React from 'react';
import './PikNGoLogo.css';

const PikNGoLogo = ({ size = 180 }) => {
  return (
    <div className="pikngo-logo-container" style={{ width: `${size}px` }}>
      <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" className="pikngo-svg">
        <defs>
          <linearGradient id="logo-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id="logo-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Pin Icon */}
        <path 
          d="M40 10C26.2 10 15 21.2 15 35C15 52.5 40 75 40 75C40 75 65 52.5 65 35C65 21.2 53.8 10 40 10Z" 
          fill="url(#logo-orange)"
          filter="url(#logo-glow)"
        />
        
        {/* White Fork Silhouette */}
        <path d="M36 25V35C36 37.2 37.8 39 40 39C42.2 39 44 37.2 44 35V25H42V33H41V25H39V33H38V25H36Z" fill="white" />
        <rect x="39" y="39" width="2" height="15" rx="1" fill="white" />

        {/* Text */}
        <text x="80" y="55" fontFamily="var(--font-heading)" fontWeight="800" fontSize="42" fill="var(--text-primary)" letterSpacing="-1">
          Pik<tspan fill="#f97316">N</tspan>Go
        </text>
      </svg>
    </div>
  );
};

export default PikNGoLogo;


