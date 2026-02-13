import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // We need this or similar for rendering SVG QR
import { Loader2, RefreshCw, ShieldCheck, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { QrSessionData } from '@/types/attendance';

interface QrDisplayProps {
    initialSession: QrSessionData;
    className?: string;
}

/**
 * Dynamic presence validation display (Admin/Manager View).
 * 
 * Security:
 * - Silent auto-refresh before expiry
 * - No visible countdowns
 * - Live connection monitoring
 */
export default function QrDisplay({ initialSession, className }: QrDisplayProps) {
    const [session, setSession] = useState<QrSessionData>(initialSession);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(true);

    const refreshQr = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/qr/generate');
            setSession(response.data);
            setError(null);
            setIsLive(true);
        } catch (err) {
            console.error("QR Refresh failed:", err);
            setError("Connection lost. Retrying...");
            setIsLive(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Set up auto-refresh 3 seconds before session expires
        const ttlMs = session.ttl * 1000;
        const refreshBuffer = 3000;
        const refreshInterval = Math.max(5000, ttlMs - refreshBuffer);

        const timer = setTimeout(() => {
            refreshQr();
        }, refreshInterval);

        return () => clearTimeout(timer);
    }, [session, refreshQr]);

    return (
        <div className={cn("flex flex-col items-center justify-center gap-12", className)}>
            {/* Status Header */}
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <div className={cn(
                        "size-2 rounded-full",
                        isLive ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(19,200,236,0.6)]" : "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
                        {isLive ? 'Encrypted Presence Link Active' : 'Offline - Reconnecting'}
                    </span>
                    <ShieldCheck className="size-3 text-primary/50" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase max-w-2xl leading-tight">
                    Scan to Validate <span className="text-primary">Presence</span>
                </h1>
            </div>

            {/* QR Container Architecture */}
            <div className="relative group">
                {/* Decorative Halo */}
                <div className="absolute -inset-16 bg-primary/10 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                
                {/* Main QR Card */}
                <div className="relative size-[380px] md:size-[500px] bg-white rounded-[40px] p-12 md:p-16 shadow-[0_20px_100px_rgba(0,0,0,0.8)] border-8 border-white/5 overflow-hidden flex items-center justify-center">
                    {/* Corner Markers */}
                    <div className="absolute top-8 left-8 size-12 border-t-8 border-l-8 border-primary/20 rounded-tl-2xl" />
                    <div className="absolute top-8 right-8 size-12 border-t-8 border-r-8 border-primary/20 rounded-tr-2xl" />
                    <div className="absolute bottom-8 left-8 size-12 border-b-8 border-l-8 border-primary/20 rounded-bl-2xl" />
                    <div className="absolute bottom-8 right-8 size-12 border-b-8 border-r-8 border-primary/20 rounded-br-2xl" />

                    {/* QR Code itself */}
                    <div className={cn(
                        "size-full transition-all duration-500",
                        isLoading ? "opacity-20 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
                    )}>
                        <QRCodeSVG 
                            value={session.token}
                            size={436}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo-black.png", // Assuming existence or fallback gracefully
                                x: undefined,
                                y: undefined,
                                height: 80,
                                width: 80,
                                excavate: true,
                            }}
                        />
                    </div>

                    {/* Loading/Error Overlays */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="size-16 text-primary animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-12 text-center">
                            <AlertCircle className="size-20 text-destructive" />
                            <p className="text-white text-xl font-bold uppercase tracking-widest">{error}</p>
                            <button 
                                onClick={refreshQr}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white font-black uppercase tracking-widest text-sm"
                            >
                                Manually Reconnect
                            </button>
                        </div>
                    )}

                    {/* Subtle Pulse Animation */}
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-primary/0 animate-qr-pulse" />
                </div>
            </div>

            {/* Footer context */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">
                    <div className="h-px w-24 bg-current" />
                    <span>Secure Arrival Ritual</span>
                    <div className="h-px w-24 bg-current" />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-center gap-3">
                        <Zap className="size-5 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-black uppercase">Instant</span>
                            <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Sub-2s Flow</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="size-5 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-black uppercase">Dynamic</span>
                            <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">30s TTL Cycle</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
