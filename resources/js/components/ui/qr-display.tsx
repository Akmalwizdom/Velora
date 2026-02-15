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
        <div className={cn("flex flex-col items-center justify-center gap-10 md:gap-14 w-full", className)}>
            {/* Status Header */}
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className={cn(
                        "size-1.5 rounded-full",
                        isLive ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(19,200,236,0.6)]" : "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                    )} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                        {isLive ? 'QR Absensi Aktif' : 'Offline - Menghubungkan Kembali'}
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                    Pindai <span className="text-primary italic">Presensi</span>
                </h1>
            </div>

            {/* QR Container Architecture */}
            <div className="relative group flex items-center justify-center w-full">
                {/* Decorative Halo */}
                <div className="absolute -inset-20 bg-primary/10 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none" />
                
                {/* Main QR Card - Resized for Dashboard */}
                <div className="relative size-[320px] md:size-[480px] bg-white rounded-[48px] p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-4 border-white/5 overflow-hidden flex items-center justify-center">
                    {/* Corner Markers - Simplified for Dashboard */}
                    <div className="absolute top-8 left-8 size-12 border-t-4 border-l-4 border-primary/10 rounded-tl-2xl" />
                    <div className="absolute top-8 right-8 size-12 border-t-4 border-r-4 border-primary/10 rounded-tr-2xl" />
                    <div className="absolute bottom-8 left-8 size-12 border-b-4 border-l-4 border-primary/10 rounded-bl-2xl" />
                    <div className="absolute bottom-8 right-8 size-12 border-b-4 border-r-4 border-primary/10 rounded-br-2xl" />

                    {/* QR Code itself */}
                    <div className={cn(
                        "w-full h-full flex items-center justify-center transition-all duration-700",
                        isLoading ? "opacity-20 scale-95 blur-md" : "opacity-100 scale-100 blur-0"
                    )}>
                        <QRCodeSVG 
                            value={session.token}
                            size={400} // Responsive size handled by SVG viewbox/container
                            style={{ width: '100%', height: '100%' }}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo-black.png",
                                x: undefined,
                                y: undefined,
                                height: 70,
                                width: 70,
                                excavate: true,
                            }}
                        />
                    </div>

                    {/* Loading/Error Overlays */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                            <RefreshCw className="size-12 text-primary animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-10 text-center">
                            <AlertCircle className="size-16 text-destructive" />
                            <p className="text-white text-lg font-bold uppercase tracking-widest leading-tight">{error}</p>
                            <button 
                                onClick={refreshQr}
                                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white font-black uppercase tracking-widest text-xs"
                            >
                                Pulihkan Koneksi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
