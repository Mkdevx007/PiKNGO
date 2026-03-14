import React from 'react';
import logoImg from '../../assets/logo_transparent.png';
import { useTheme } from '../../context/ThemeContext';

const Logo = ({ size = 50, width, height, className = "" }) => {
    const { isDarkMode } = useTheme();

    // Width and height can be explicit, otherwise derive from size (maintains aspect ratio of logo ~3:1)
    const logoWidth = width || size * 3;
    const logoHeight = height || size;

    // Dark mode: invert to white + orange glow so logo pops on dark background
    // Light mode: show original orange+navy colors with a soft shadow
    const logoFilter = isDarkMode
        ? 'brightness(0) invert(1) drop-shadow(0 4px 15px rgba(255,107,0,0.6))'
        : 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))';


    return (
        <div className={`logo-wrapper ${className}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                src={logoImg}
                alt="PikNGo Logo"
                style={{
                    width: logoWidth,
                    height: logoHeight,
                    objectFit: 'contain',
                    filter: logoFilter,
                    transition: 'filter 0.4s ease'
                }}
            />
        </div>
    );
};

export default Logo;
