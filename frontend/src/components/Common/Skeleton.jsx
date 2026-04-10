import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
    const style = {
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '4px'
    };

    return <div className={`skeleton-base ${className}`} style={style}></div>;
};

export const CardSkeleton = () => (
    <div className="skeleton-card glass-card">
        <div className="skeleton-image-placeholder"></div>
        <div className="skeleton-content">
            <Skeleton width="70%" height="24px" className="mb-2" />
            <Skeleton width="40%" height="16px" className="mb-4" />
            <div className="flex-row gap-2">
                <Skeleton width="80px" height="32px" borderRadius="8px" />
                <Skeleton width="80px" height="32px" borderRadius="8px" />
            </div>
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="skeleton-table">
        <div className="skeleton-table-header">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height="20px" width="100px" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="skeleton-table-row">
                {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} height="16px" />
                ))}
            </div>
        ))}
    </div>
);

export default Skeleton;
