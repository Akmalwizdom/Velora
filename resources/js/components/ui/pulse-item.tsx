import { cn } from '@/lib/utils';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';

interface PulseItemProps {
    type: 'warning' | 'peak' | 'success';
    title: string;
    desc: string;
    action?: string;
    members?: string[];
    className?: string;
}

export function PulseItem({ 
    type, 
    title, 
    desc, 
    action, 
    members,
    className 
}: PulseItemProps) {
    const isWarning = type === 'warning';
    const isPeak = type === 'peak';
    
    return (
        <div className={cn(
            'p-4 rounded-xl border transition-all duration-300 group',
            isPeak 
                ? 'border-primary/20 bg-primary/5' 
                : 'border-white/5 bg-white/5 hover:border-white/10',
            className
        )}>
            <div className="flex items-start gap-3">
                <div className={cn(
                    'size-8 rounded-lg flex items-center justify-center shrink-0',
                    isWarning ? 'bg-orange-500/20 text-orange-500' : 
                    isPeak ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'
                )}>
                    {isWarning ? <AlertTriangle className="size-5" /> : 
                     isPeak ? <Zap className="size-5" /> : <ShieldCheck className="size-5" />}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-1">{title}</p>
                    <p className="text-xs text-muted-dynamics leading-relaxed">{desc}</p>
                    {action && (
                        <button className="mt-3 text-[10px] font-bold text-primary hover:underline uppercase transition-all">
                            {action}
                        </button>
                    )}
                    {members && (
                        <div className="mt-3 flex -space-x-2">
                            {members.map((m, i) => (
                                <div key={i} className="size-6 rounded-full border border-header-background bg-surface-dark flex items-center justify-center text-[8px] font-bold overflow-hidden shadow-sm">
                                    {(m.startsWith('+')) ? m : <img src={`https://i.pravatar.cc/150?i=${i+10}`} alt="Member" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
