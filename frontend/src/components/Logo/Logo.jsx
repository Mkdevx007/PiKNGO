import React from 'react';
import PikNGoLogo from '../Navbar/PikNGoLogo';

const Logo = ({ className = "" }) => {
    return (
        <div className={`logo-parent ${className}`}>
            <PikNGoLogo />
        </div>
    );
};

export default Logo;
