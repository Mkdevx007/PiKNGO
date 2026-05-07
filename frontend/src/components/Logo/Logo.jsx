import React from 'react';
import PikNGoLogo from '../Navbar/PikNGoLogo';

const Logo = ({ className = "", size }) => {
    return (
        <div className={`logo-parent ${className}`}>
            <PikNGoLogo size={size} />
        </div>
    );
};

export default Logo;

