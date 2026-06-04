import React from 'react';
import './PikNGoLogo.css';

const PikNGoLogo = ({ size = 180 }) => {
  return (
    <div className="pikngo-logo-container" style={{ width: `${size}px` }}>
      <img 
        src="/pwa-512x512.png" 
        alt="PikNGo Premium Logo" 
        className="pikngo-logo-img" 
      />
      <span className="pikngo-logo-text">
        Pik<span className="accent-n">N</span>Go
      </span>
    </div>
  );
};

export default PikNGoLogo;


