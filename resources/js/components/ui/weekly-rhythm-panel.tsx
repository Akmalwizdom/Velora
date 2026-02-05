import { cn } from '@/lib/utils';
import { Activity, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WeeklyRhythmData {
    weekData: {
        day: string;
        status: 'on_time' | 'late' | 'absent' | 'none';
        hours: number;
    }[];
    summary: {
        onTimeDays: number;
        totalDays: number;
        totalHours: number;
        trend: number; // percentage vs last week
    };
    patternLabel?: string; // "Consistent presence" | "Flexible schedule" etc.
}

interface WeeklyRhythmPanelProps {
    data?: WeeklyRhythmData;
    isLoading?: boolean;
    className?: string;
}

const defaultData: WeeklyRhythmData = {
    weekData: [
        { day: 'M', status: 'on_time', hours: 8 },
        { day: 'T', status: 'on_time', hours: 8.5 },
        { day: 'W', status: 'late', hours: 7.5 },
        { day: 'T', status: 'on_time', hours: 8 },
        { day: 'F', status: 'none', hours: 0 },
        { day: 'S', status: 'none', hours: 0 },
        { day: 'S', status: 'none', hours: 0 },
    ],
    summary: {
        onTimeDays: 3,
        totalDays: 4,
        totalHours: 32,
        trend: 5,
    },
    patternLabel: 'Consistent presence',
};

/**
 * Weekly Rhythm Panel - Glanceable weekly attendance visualization
 * 
 * Design principles (from skills):
 * - Glassmorphism with dark theme
 * - Primary color: #13C8EC (cyan-400)
 * - Uppercase labels with tracking-widest
 * - Observational language (non-punitive)
 * - Smooth animations & micro-interactions
 */
export function WeeklyRhythmPanel({ 
    data = defaultData, 
    isLoading = false,
    className 
}: WeeklyRhythmPanelProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const statusStyles = {
        on_time: 'bg-primary shadow-[0_0_12px_rgba(19,200,236,0.5)]',
        late: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
        absent: 'bg-white/10',
        none: 'bg-white/5',
    };

    const maxHours = Math.max(...data.weekData.map(d => d.hours), 8);

    if (isLoading) {
        return (
            <div className={cn(
                'p-6 rounded-2xl border border-white/5 bg-[#111718]/50 backdrop-blur-md',
                'animate-pulse',
                className
            )}>
                <div className="h-4 w-32 bg-white/10 rounded mb-6" />
                <div className="flex gap-2 h-20">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'p-7 rounded-2xl border border-white/5 bg-[#111718]/50 backdrop-blur-md',
            'transition-all duration-500 hover:border-white/10',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            className
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Activity className="size-4 text-primary" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                            Weekly Rhythm
                        </span>
                    </div>
                    {data.patternLabel && (
                        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
                            <Sparkles className="size-3 text-primary/60" />
                            <span className="text-xs text-muted-dynamics font-medium">
                                {data.patternLabel}
                            </span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold',
                    data.summary.trend >= 0 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-400'
                )}>
                    <TrendingUp className={cn('size-3', data.summary.trend < 0 && 'rotate-180')} />
                    {data.summary.trend >= 0 ? '+' : ''}{data.summary.trend}%
                </div>
            </div>

            {/* Weekly Bar Chart - Glanceable Visualization */}
            <div className="flex gap-2 h-24 mb-6 items-end">
                {data.weekData.map((day, i) => (
                    <div 
                        key={i} 
                        className="flex-1 flex flex-col items-center gap-2 group"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {/* Bar */}
                        <div className="w-full h-full flex items-end">
                            <div 
                                className={cn(
                                    'w-full rounded-lg transition-all duration-500',
                                    statusStyles[day.status],
                                    'group-hover:scale-[1.05] cursor-pointer'
                                )}
                                style={{ 
                                    height: day.hours > 0 
                                        ? `${Math.max((day.hours / maxHours) * 100, 15)}%` 
                                        : '8%',
                                    transitionDelay: `${i * 50}ms`,
                                }}
                            />
                        </div>
                        {/* Day Label */}
                        <span className={cn(
                            'text-[10px] font-bold uppercase tracking-wide transition-colors',
                            day.status === 'on_time' ? 'text-primary' : 
                            day.status === 'late' ? 'text-amber-400' : 
                            'text-slate-600'
                        )}>
                            {day.day}
                        </span>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            On Time
                        </span>
                        <span className="text-lg font-black text-white">
                            {data.summary.onTimeDays}
                            <span className="text-sm font-normal text-muted-dynamics ml-1">
                                / {data.summary.totalDays}
                            </span>
                        </span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Hours
                        </span>
                        <span className="text-lg font-black text-white">
                            {data.summary.totalHours}h
                        </span>
                    </div>
                </div>

                {/* Action Hint */}
                <button className="group flex items-center gap-1 text-[10px] font-bold text-muted-dynamics hover:text-primary transition-colors uppercase tracking-wide">
                    View History
                    <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-primary shadow-[0_0_6px_rgba(19,200,236,0.5)]" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide">On time</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide">Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-white/20" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide">Not logged</span>
                </div>
            </div>
        </div>
    );
}
