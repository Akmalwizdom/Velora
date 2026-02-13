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
 * High-performance QR presence validation scanner.
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

    useEffect(() => {
        // Start scanner on mount
        const qrCodeRegionId = "qr-reader";
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);

        const startScanner = async () => {
            try {
                // Get cameras
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length > 0) {
                    // Prefer back camera
                    const cameraId = cameras.length > 1 ? cameras[1].id : cameras[0].id;
                    
                    await scannerRef.current?.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                        },
                        onScanSuccess,
                        onScanFailure
                    );
                    setIsInitializing(false);
                } else {
                    setError("No cameras found on this device.");
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera permission denied or not available.");
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
                scannerRef.current.stop().catch(e => console.error("Stop error", e));
            }
        };
    }, []);

    const onScanSuccess = async (decodedText: string) => {
        if (isValidating || success) return;

        setIsValidating(true);
        setError(null);

        try {
            const response = await axios.post('/qr/validate', {
                token: decodedText,
                // Optional: add lightweight location if permission already granted
                ...(await getLightweightLocation())
            });

            if (response.data.success) {
                // Haptic feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate(200);
                }
                
                setSuccess(true);
                
                // Sub-second confirmation delay for UX feedback
                setTimeout(() => {
                    onSuccess(response.data.attendance);
                }, 800);
            }
        } catch (err: any) {
            console.error("Validation error:", err);
            setError(err.response?.data?.message || "Invalid QR code. Please scan again.");
            setIsValidating(false);
            
            // Auto-clear error after 3 seconds so they can try again
            setTimeout(() => setError(null), 3000);
        }
    };

    const onScanFailure = (error: string) => {
        // Silently ignore failures during scanning as it's common (blur, glare)
    };

    const getLightweightLocation = async () => {
        try {
            if ('geolocation' in navigator) {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000,
                        maximumAge: 60000,
                        enableHighAccuracy: false // Fast over accurate
                    });
                });
                
                return {
                    location_lat: pos.coords.latitude,
                    location_lng: pos.coords.longitude,
                    location_accuracy: pos.coords.accuracy <= 50 ? 'high' : 'medium'
                };
            }
        } catch (e) {
            // Ignore if blocked - security is server-side
        }
        return {};
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
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Presence Validation</h2>
                    <p className="text-muted-dynamics text-xs font-medium uppercase tracking-widest opacity-60">Scan the live QR code on the display</p>
                </div>

                <div className="relative size-[280px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div id="qr-reader" className="size-full"></div>
                    
                    {/* Scanner Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="size-[200px] border-2 border-primary/30 rounded-2xl relative">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary rounded-tl-lg -translate-x-1 -translate-y-1" />
                            <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary rounded-tr-lg translate-x-1 -translate-y-1" />
                            <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary rounded-bl-lg -translate-x-1 translate-y-1" />
                            <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-primary rounded-br-lg translate-x-1 translate-y-1" />
                            
                            {/* Scanning Line Animation */}
                            {!success && !isInitializing && !error && (
                                <div className="absolute inset-x-0 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(19,200,236,0.8)] animate-qr-scan" />
                            )}
                        </div>
                    </div>

                    {/* Status Overlays */}
                    {isInitializing && (
                        <div className="absolute inset-0 bg-background-dark/80 flex flex-col items-center justify-center gap-4 text-white">
                            <Loader2 className="size-8 text-primary animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Waking Camera...</span>
                        </div>
                    )}

                    {isValidating && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white">
                            <Loader2 className="size-8 text-white animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Validating Presence...</span>
                        </div>
                    )}

                    {success && (
                        <div className="absolute inset-0 bg-green-500/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="size-16 text-white" />
                            <span className="text-sm font-black uppercase tracking-[0.3em]">Presence Confirmed</span>
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
                    <span className="text-[10px] font-black uppercase tracking-widest">Velora Secure</span>
                    <div className="h-px w-20 bg-current" />
                </div>
            </div>
        </div>
    );
}
