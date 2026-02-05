import { cn } from '@/lib/utils';
import { Briefcase, Building2, Home, Laptop, MapPin } from 'lucide-react';
import React from 'react';

type WorkMode = 'office' | 'remote' | 'hybrid' | 'business_trip';

interface WorkModeSelectorProps {
    value: WorkMode;
    onChange: (mode: WorkMode) => void;
    disabled?: boolean;
    className?: string;
}

const workModes: { 
    value: WorkMode; 
    label: string; 
    shortLabel: string;
    icon: React.ReactNode;
    description?: string;
}[] = [
    { 
        value: 'office', 
        label: 'Office', 
        shortLabel: 'Office',
        icon: <Building2 className="size-4" />,
        description: 'On-site work'
    },
    { 
        value: 'remote', 
        label: 'Remote', 
        shortLabel: 'Remote',
        icon: <Home className="size-4" />,
        description: 'Working from home'
    },
    { 
        value: 'hybrid', 
        label: 'Hybrid', 
        shortLabel: 'Hybrid',
        icon: <Laptop className="size-4" />,
        description: 'Mixed schedule'
    },
    { 
        value: 'business_trip', 
        label: 'Business Trip', 
        shortLabel: 'Trip',
        icon: <Briefcase className="size-4" />,
        description: 'Travel / client visit'
    },
];

/**
 * WorkModeSelector - Inline work mode selection with Velora design
 * 
 * Features:
 * - Horizontal pill selector for quick selection
 * - Icon + label for each mode
 * - Smooth transitions with primary glow on selection
 * - Responsive: shows short labels on mobile
 */
export function WorkModeSelector({ 
    value, 
    onChange, 
    disabled = false,
    className 
}: WorkModeSelectorProps) {
    return (
        <div className={cn(
            'inline-flex items-center gap-1 p-1 rounded-xl',
            'bg-white/5 border border-white/5',
            disabled && 'opacity-50 pointer-events-none',
            className
        )}>
            {workModes.map((mode) => (
                <button
                    key={mode.value}
                    type="button"
                    onClick={() => onChange(mode.value)}
                    disabled={disabled}
                    className={cn(
                        'group flex items-center gap-2 px-3 py-2 rounded-lg',
                        'text-[10px] font-bold uppercase tracking-widest',
                        'transition-all duration-300 cursor-pointer',
                        value === mode.value
                            ? 'bg-primary text-background-dark shadow-[0_0_20px_rgba(19,200,236,0.3)]'
                            : 'text-muted-dynamics hover:text-white hover:bg-white/5'
                    )}
                    title={mode.description}
                >
                    <span className={cn(
                        'transition-transform duration-200',
                        value === mode.value && 'scale-110'
                    )}>
                        {mode.icon}
                    </span>
                    <span className="hidden sm:inline">{mode.label}</span>
                    <span className="sm:hidden">{mode.shortLabel}</span>
                </button>
            ))}
        </div>
    );
}

/**
 * Compact variant - icon-only selector for tight spaces
 */
export function WorkModeSelectorCompact({ 
    value, 
    onChange, 
    disabled = false,
    className 
}: WorkModeSelectorProps) {
    return (
        <div className={cn(
            'inline-flex items-center gap-1 p-1 rounded-xl',
            'bg-white/5 border border-white/5',
            disabled && 'opacity-50 pointer-events-none',
            className
        )}>
            {workModes.map((mode) => (
                <button
                    key={mode.value}
                    type="button"
                    onClick={() => onChange(mode.value)}
                    disabled={disabled}
                    className={cn(
                        'p-2.5 rounded-lg transition-all duration-300',
                        value === mode.value
                            ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(19,200,236,0.3)]'
                            : 'text-muted-dynamics hover:text-white hover:bg-white/5'
                    )}
                    title={mode.label}
                >
                    {mode.icon}
                </button>
            ))}
        </div>
    );
}

/**
 * Display badge for current work mode (read-only)
 */
export function WorkModeBadge({ 
    mode, 
    className 
}: { 
    mode: WorkMode; 
    className?: string;
}) {
    const modeConfig = workModes.find(m => m.value === mode) || workModes[0];
    
    return (
        <div className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
            'bg-white/5 border border-white/5',
            'text-[10px] font-bold uppercase tracking-widest text-muted-dynamics',
            className
        )}>
            <span className="text-primary">{modeConfig.icon}</span>
            <span>Work Mode: {modeConfig.label}</span>
        </div>
    );
}
