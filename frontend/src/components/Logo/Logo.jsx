import React from 'react';

const Logo = ({ size = 32, className = "" }) => {
    return (
        <div className={`logo-wrapper ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 4px 10px var(--accent-orange-glow))' }}
            >
                {/* Background geometric shape */}
                <rect x="2" y="2" width="36" height="36" rx="10" fill="var(--accent-orange)" />

                {/* Fast swoosh / Pin element */}
                <path
                    d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28M15 20H25M20 15V25"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Speed lines */}
                <path
                    d="M5 14H10M5 20H8M5 26H10"
                    stroke="white"
                    strokeOpacity="0.5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
            <span style={{
                fontSize: size * 0.8,
                fontWeight: 800,
                letterSpacing: '-1.5px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)'
            }}>
                <span style={{ color: 'var(--accent-orange)' }}>Pik</span>NGo
            </span>
        </div>
    );
};

export default Logo;
