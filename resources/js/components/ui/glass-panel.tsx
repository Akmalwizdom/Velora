import { cn } from '@/lib/utils';
import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
    intensity?: 'low' | 'medium' | 'high';
}

export function GlassPanel({
    children,
    className,
    hoverable = false,
    intensity = 'medium',
    ...props
}: GlassPanelProps) {
    const intensities = {
        low: 'bg-white/5 backdrop-blur-sm',
        medium: 'bg-white/10 backdrop-blur-md',
        high: 'bg-white/20 backdrop-blur-lg',
    };

    return (
        <div
            className={cn(
                'rounded-xl border border-white/10 transition-all duration-300',
                intensities[intensity],
                hoverable && 'hover:bg-white/15 hover:border-white/20 hover:translate-y-[-2px] cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
