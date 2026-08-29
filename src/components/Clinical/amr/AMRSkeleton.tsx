'use client';

import React from 'react';

export const AMRSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl border border-slate-200 bg-slate-100" />
                ))}
            </div>

            {/* Result Card Skeleton */}
            <div className="h-44 rounded-xl border border-slate-200 bg-slate-100" />

            {/* Main Chart Skeleton */}
            <div className="h-96 rounded-xl border border-slate-200 bg-slate-100" />
        </div>
    );
};