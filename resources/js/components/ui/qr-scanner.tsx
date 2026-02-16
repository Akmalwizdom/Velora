import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface QrScannerProps {
    onSuccess: (attendance: any) => void;
    onClose: () => void;
    className?: string;
}

/**
 * High-performance QR check-in scanner.
 * 
 * UX Contract:
 * - Instant camera launch on mount
 * - Haptic feedback on success
 * - Sub-second confirmation
 * - Auto-retries on failure
 */
export default function QrScanner({ onSuccess, onClose, className }: QrScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [success, setSuccess] = useState(false);
    const isStartedRef = useRef(false);

    useEffect(() => {
        if (isStartedRef.current) return;
        
        // Start scanner on mount
        const qrCodeRegionId = "qr-reader";
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);

        const startScanner = async () => {
            if (isStartedRef.current) return;
            isStartedRef.current = true;

            try {
                // Get cameras
                const cameras = await Html5Qrcode.getCameras().catch(() => []);
                
                if (cameras && cameras.length > 0) {
                    // Prefer back camera
                    const cameraId = cameras.length > 1 ? cameras[1].id : cameras[0].id;
                    
                    await scannerRef.current?.start(
                        { facingMode: "environment" },
                        {
                            fps: 20, // High-performance polling
                            qrbox: { width: 280, height: 280 }, // Optimize for distant/sharp scan
                            aspectRatio: 1.0,
                            videoConstraints: {
                                focusMode: "continuous",
                            } as any
                        },
                        onScanSuccess,
                        onScanFailure
                    ).catch(err => {
                        // If facingMode environment fails, try default
                        return scannerRef.current?.start(
                            cameraId,
                            { 
                                fps: 20, 
                                qrbox: { width: 280, height: 280 }, 
                                aspectRatio: 1.0 
                            },
                            onScanSuccess,
                            onScanFailure
                        );
                    });
                    
                    setIsInitializing(false);
                } else {
                    setError("No cameras found on this device.");
                    isStartedRef.current = false;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera permission denied or not available.");
                isStartedRef.current = false;
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
                scannerRef.current.stop().catch(e => console.error("Stop error", e));
            }
        };
    }, []);

    const playSuccessSound = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
            oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.15);
            
            oscillator.connect(gain);
            gain.connect(context.destination);
            
            oscillator.start();
            oscillator.stop(context.currentTime + 0.15);
        } catch (e) {
            console.warn("Audio feedback failed:", e);
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        if (isValidating || success) return;

        // Visual feedback for detection
        setIsValidating(true);
        setError(null);

        // Multi-modal feedback
        playSuccessSound();
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }

        try {
            const response = await axios.post('/qr/validate', {
                token: decodedText,
            });

            if (response.data.success) {
                setSuccess(true);
                
                // Keep success screen visible for at least 1 second for user to register
                setTimeout(() => {
                    onSuccess(response.data.attendance);
                }, 1200);
            }
        } catch (err: any) {
            console.error("Check-in error:", err);
            setError(err.response?.data?.message || "Invalid QR code. Please scan again.");
            setIsValidating(false);
            
            // Auto-clear error after 3 seconds so they can try again
            setTimeout(() => setError(null), 3500);
        }
    };

    const onScanFailure = (error: string) => {
        // Silently ignore failures during scanning as it's common (blur, glare)
    };


    return (
        <div className={cn("fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300", className)}>
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
            >
                <X className="size-6" />
            </button>

            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Scan Presensi</h2>
                    <p className="text-muted-dynamics text-xs font-medium uppercase tracking-widest opacity-60">Pindai kode QR yang ada di layar</p>
                </div>

                <div className="relative size-[300px] rounded-3xl overflow-hidden border-2 border-white/10 bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div id="qr-reader" className="size-full"></div>
                    
                    {/* Scanner Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="size-[220px] border-2 border-primary/20 rounded-2xl relative">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 size-10 border-t-4 border-l-4 border-primary rounded-tl-xl -translate-x-2 -translate-y-2" />
                            <div className="absolute top-0 right-0 size-10 border-t-4 border-r-4 border-primary rounded-tr-xl translate-x-2 -translate-y-2" />
                            <div className="absolute bottom-0 left-0 size-10 border-b-4 border-l-4 border-primary rounded-bl-xl -translate-x-2 translate-y-2" />
                            <div className="absolute bottom-0 right-0 size-10 border-b-4 border-r-4 border-primary rounded-br-xl translate-x-2 translate-y-2" />
                            
                            {/* Scanning Line Animation */}
                            {!success && !isInitializing && !error && (
                                <div className="absolute inset-x-0 h-1 bg-primary/60 shadow-[0_0_20px_rgba(19,200,236,1)] animate-qr-scan" />
                            )}
                        </div>
                    </div>

                    {/* Status Overlays */}
                    {isInitializing && (
                        <div className="absolute inset-0 bg-background-dark/90 flex flex-col items-center justify-center gap-4 text-white z-10">
                            <Loader2 className="size-10 text-primary animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 animate-pulse">Menyiapkan Kamera...</span>
                        </div>
                    )}

                    {isValidating && (
                        <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-md flex flex-col items-center justify-center gap-5 text-white z-20">
                            <div className="relative flex items-center justify-center">
                                <Loader2 className="size-16 text-primary animate-spin" />
                                <div className="absolute size-8 bg-primary/20 rounded-full animate-ping" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black uppercase tracking-[0.3em] mb-1">Divalidasi</span>
                                <span className="block text-[10px] text-muted-dynamics uppercase font-bold tracking-widest opacity-50">Menghubungkan ke Server...</span>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="absolute inset-0 bg-primary flex flex-col items-center justify-center gap-6 text-white z-30 animate-in zoom-in-95 duration-500">
                            <div className="size-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40 shadow-2xl">
                                <CheckCircle2 className="size-16 text-white" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black uppercase tracking-[0.4em] mb-2">Berhasil</h3>
                                <div className="h-1 w-12 bg-white/30 mx-auto rounded-full" />
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-bottom-2 duration-300">
                        <AlertCircle className="size-5 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wide leading-tight">{error}</span>
                    </div>
                )}

                <div className="flex items-center gap-4 text-white/20">
                    <Camera className="size-4" />
                    <div className="h-px w-20 bg-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Velora Hub</span>
                    <div className="h-px w-20 bg-current" />
                </div>
            </div>
        </div>
    );
}
