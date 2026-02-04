import { cn } from '@/lib/utils';
import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: string;
    trendColor?: 'green' | 'red';
    subValue?: string;
    isPrimary?: boolean;
    className?: string;
}

export function StatCard({ 
    label, 
    value, 
    trend, 
    trendColor, 
    subValue, 
    isPrimary,
    className 
}: StatCardProps) {
    return (
        <div className={cn(
            'p-5 rounded-xl border backdrop-blur-sm transition-all duration-300',
            isPrimary 
                ? 'border-primary/20 bg-primary/5 shadow-[0_0_20px_rgba(19,200,236,0.05)]' 
                : 'border-white/5 bg-white/5 hover:border-white/10',
            className
        )}>
            <p className={cn(
                'text-sm font-medium mb-1', 
                isPrimary ? 'text-primary uppercase tracking-wider' : 'text-muted-dynamics'
            )}>
                {label}
            </p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                    {value} 
                    {subValue && <span className="ml-1 text-lg opacity-40 font-normal">{subValue}</span>}
                </span>
                {trend && (
                    <span className={cn(
                        'text-xs font-bold', 
                        trendColor === 'green' ? 'text-green-400' : 'text-orange-400'
                    )}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
