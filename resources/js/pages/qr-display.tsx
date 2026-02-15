import React from 'react';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import QrDisplay from '@/components/ui/qr-display';
import { QrSessionData } from '@/types/attendance';

interface Props {
    initialSession: QrSessionData;
}

/**
 * Dedicated Admin QR Display Page Integrated with Sidebar.
 */
export default function QrDisplayPage({ initialSession }: Props) {
    return (
        <DashboardLayout title="Layar Presensi">
            <div className="min-h-full flex flex-col items-center justify-center p-8 md:p-12 selection:bg-primary/30">
                {/* Main Validation Target - Integrated Centering */}
                <div className="relative z-10 w-full max-w-4xl flex items-center justify-center">
                    <QrDisplay initialSession={initialSession} />
                </div>

                {/* Decorative Elements matched to dashboard style */}
                <div className="absolute bottom-[-100px] right-[-100px] size-[400px] border border-white/[0.03] rounded-full pointer-events-none" />
            </div>
        </DashboardLayout>
    );
}
