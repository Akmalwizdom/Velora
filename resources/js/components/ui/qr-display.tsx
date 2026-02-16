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
    const [timeLeft, setTimeLeft] = useState(initialSession.ttl);

    const refreshQr = useCallback(async () => {
        setIsLoading(true);
        try {
            // Keep the same type when refreshing
            const response = await axios.get(`/qr/generate?type=${session.type}`);
            setSession(response.data);
            setTimeLeft(response.data.ttl);
            setError(null);
            setIsLive(true);
        } catch (err) {
            console.error("QR Refresh failed:", err);
            setError("Connection lost. Retrying...");
            setIsLive(false);
        } finally {
            setIsLoading(false);
        }
    }, [session.type]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    refreshQr();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [refreshQr]);

    const progress = (timeLeft / session.ttl) * 100;
    const isCheckIn = session.type === 'check_in';

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
                        {isLive ? 'Sistem Absensi Terenkripsi' : 'Offline - Menghubungkan Kembali'}
                    </span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                        "px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        isCheckIn 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                        Sesi {isCheckIn ? 'Masuk Pagi' : 'Pulang Kerja'}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        Pindai <span className="text-primary italic">Presensi</span>
                    </h1>
                </div>
            </div>

            {/* QR Container Architecture */}
            <div className="flex flex-col items-center gap-8 w-full max-w-lg">
                <div className="relative group flex items-center justify-center w-full">
                    {/* Decorative Halo */}
                    <div className="absolute -inset-20 bg-primary/10 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none" />
                    
                    {/* Main QR Card */}
                    <div className="relative size-[320px] md:size-[440px] bg-white rounded-[48px] p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-4 border-white/5 overflow-hidden flex items-center justify-center">
                        <div className={cn(
                            "w-full h-full flex items-center justify-center transition-all duration-700",
                            isLoading ? "opacity-20 scale-95 blur-md" : "opacity-100 scale-100 blur-0"
                        )}>
                            <QRCodeSVG 
                                value={session.token}
                                size={400}
                                style={{ width: '100%', height: '100%' }}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: "/logo-black.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 60,
                                    width: 60,
                                    excavate: true,
                                }}
                            />
                        </div>

                        {/* Loading Overlay */}
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

                {/* TTL & Progress Bar */}
                <div className="w-full space-y-4 px-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Keamanan</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">Dynamic Refresh</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="size-3 text-primary animate-pulse" />
                            <span className="text-xl font-black text-white tabular-nums">
                                00:{timeLeft.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(19,200,236,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    <p className="text-[9px] text-center text-white/20 font-medium uppercase tracking-[0.3em]">
                        Kode diperbarui secara otomatis untuk keamanan
                    </p>
                </div>
            </div>
        </div>
    );
}
