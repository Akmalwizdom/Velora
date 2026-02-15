import React from 'react';
import { Head } from '@inertiajs/react';
import QrDisplay from '@/components/ui/qr-display';
import { QrSessionData } from '@/types/attendance';
import { Shield, Monitor, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    initialSession: QrSessionData;
}

/**
 * Dedicated Admin QR Display Page.
 * Optimized for full-screen wall-mounted monitors.
 */
export default function QrDisplayPage({ initialSession }: Props) {
    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary/30">
            <Head title="Layar Presensi" />

            {/* Background Texture Architecture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(19,200,236,0.08)_0%,_transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100 pointer-events-none" />
            
            {/* Structural Accents */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/5" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-white/5" />
            <div className="absolute inset-y-0 left-0 w-px bg-white/5" />
            <div className="absolute inset-y-0 right-0 w-px bg-white/5" />

            {/* Top Navigation / Status Path */}
            <div className="absolute top-12 left-12 flex flex-col gap-2">
                <div className="flex items-center gap-4 text-white/20">
                    <Shield className="size-4" />
                    <div className="h-4 w-px bg-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Velora Station</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase tracking-widest">PRESENSI</span>
                    <span className="text-[10px] text-white/10">/</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Pusat Presensi</span>
                </div>
            </div>

            <div className="absolute top-12 right-12 flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Display Station</span>
                    <span className="text-xs font-black text-white uppercase font-mono tracking-tighter">DN-VE-04-A</span>
                </div>
                <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Monitor className="size-5 text-primary/50" />
                </div>
            </div>

            {/* Main Validation Target */}
            <div className="relative z-10 w-full max-w-5xl px-12">
                <QrDisplay initialSession={initialSession} />
            </div>

            {/* Bottom System Logs Hint */}
            <div className="absolute bottom-12 inset-x-0 px-12 flex justify-between items-end">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</span>
                            <span className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Wajib</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Time Sync</span>
                            <span className="text-white text-[10px] font-black uppercase tracking-widest font-mono">UTC+07:00</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] rotate-180 vertical-text origin-center">Velora Core</span>
                    <div className="size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <LayoutGrid className="size-4 text-white/20" />
                    </div>
                </div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute bottom-[-100px] right-[-100px] size-[400px] border border-white/[0.03] rounded-full" />
            <div className="absolute bottom-[-50px] right-[-50px] size-[200px] border border-white/[0.05] rounded-full" />
        </div>
    );
}
