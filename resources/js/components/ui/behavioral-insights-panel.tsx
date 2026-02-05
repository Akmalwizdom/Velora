import { cn } from '@/lib/utils';
import { BarChart3, Brain, Eye, Sparkles, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BehavioralSignal {
    id: string;
    type: 'positive' | 'neutral' | 'info';
    message: string;
    icon?: 'sparkles' | 'trending' | 'brain' | 'eye';
}

interface BehavioralInsightsData {
    signals: BehavioralSignal[];
    message?: string; // Fallback when no patterns detected
}

interface BehavioralInsightsPanelProps {
    data?: BehavioralInsightsData;
    isLoading?: boolean;
    className?: string;
}

const defaultData: BehavioralInsightsData = {
    signals: [
        { id: '1', type: 'positive', message: 'Consistent morning presence observed', icon: 'sparkles' },
        { id: '2', type: 'neutral', message: 'Regular check-in time pattern', icon: 'trending' },
    ],
};

const iconMap = {
    sparkles: Sparkles,
    trending: TrendingUp,
    brain: Brain,
    eye: Eye,
};

const signalStyles = {
    positive: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: 'text-emerald-400',
        text: 'text-emerald-300',
    },
    neutral: {
        bg: 'bg-white/5',
        border: 'border-white/10',
        icon: 'text-primary',
        text: 'text-white',
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: 'text-blue-400',
        text: 'text-blue-300',
    },
};

/**
 * BehavioralInsightsPanel - Observational, non-punitive pattern insights
 * 
 * Design principles:
 * - OBSERVATIONAL ONLY - no scoring or ranking
 * - Neutral, supportive language
 * - Glanceable pattern summaries
 * - Soft, encouraging visual treatment
 */
export function BehavioralInsightsPanel({ 
    data = defaultData, 
    isLoading = false,
    className 
}: BehavioralInsightsPanelProps) {
    const [visibleCount, setVisibleCount] = useState(0);

    // Staggered reveal animation
    useEffect(() => {
        if (!data.signals.length) return;
        
        const timer = setInterval(() => {
            setVisibleCount(prev => {
                if (prev >= data.signals.length) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 150);

        return () => clearInterval(timer);
    }, [data.signals.length]);

    if (isLoading) {
        return (
            <div className={cn(
                'p-6 rounded-2xl border border-white/5 bg-[#111718]/50 backdrop-blur-md',
                className
            )}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-4 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data.signals.length && data.message) {
        return (
            <div className={cn(
                'p-6 rounded-2xl border border-white/5 bg-[#111718]/50 backdrop-blur-md',
                className
            )}>
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="size-4 text-primary" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                        Behavioral Insights
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Eye className="size-8 text-white/10 mb-3" />
                    <p className="text-sm text-muted-dynamics">{data.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'p-6 rounded-2xl border border-white/5 bg-[#111718]/50 backdrop-blur-md',
            'transition-all duration-300 hover:border-white/10',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                        Behavioral Insights
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-dynamics bg-white/5 px-2 py-1 rounded-full">
                    <BarChart3 className="size-3" />
                    <span className="uppercase tracking-wide">Observational</span>
                </div>
            </div>

            {/* Signals List */}
            <div className="space-y-2">
                {data.signals.map((signal, index) => {
                    const IconComponent = iconMap[signal.icon || 'sparkles'];
                    const styles = signalStyles[signal.type];
                    const isVisible = index < visibleCount;

                    return (
                        <div
                            key={signal.id}
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border',
                                styles.bg,
                                styles.border,
                                'transition-all duration-300',
                                isVisible 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-4'
                            )}
                            style={{ transitionDelay: `${index * 50}ms` }}
                        >
                            <div className={cn(
                                'size-8 rounded-lg flex items-center justify-center',
                                'bg-white/5 border border-white/5'
                            )}>
                                <IconComponent className={cn('size-4', styles.icon)} />
                            </div>
                            <p className={cn('text-sm font-medium', styles.text)}>
                                {signal.message}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Footer Note */}
            <p className="text-[9px] text-slate-600 uppercase tracking-wide mt-4 pt-3 border-t border-white/5">
                Patterns are observational • No scoring applied
            </p>
        </div>
    );
}
