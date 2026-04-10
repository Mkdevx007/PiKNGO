import React, { useState } from 'react';

const SafeImage = ({ src, alt, className, fallbackSrc }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);

    const defaultFallback = "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000";

    const handleError = () => {
        if (!error) {
            setImgSrc(fallbackSrc || defaultFallback);
            setError(true);
        }
    };

    return (
        <img 
            src={imgSrc || defaultFallback} 
            alt={alt} 
            className={`${className} ${error ? 'image-fallback-active' : ''}`} 
            onError={handleError}
        />
    );
};

export default SafeImage;
