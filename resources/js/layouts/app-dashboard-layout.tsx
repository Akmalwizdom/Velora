import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import React from 'react';
import { AppNavSidebar } from '../components/app-nav-sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    slimSidebar?: boolean;
}

export default function DashboardLayout({ children, title, slimSidebar = false }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background-dark text-white font-sans selection:bg-primary selection:text-black">
            <Head title={title} />
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 grid-bg opacity-30" />
            </div>

            <AppNavSidebar slim={slimSidebar} />

            <main className={cn(
                'min-h-screen transition-all duration-300 relative z-10',
                slimSidebar ? 'pl-20' : 'pl-64'
            )}>
                <div className="p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
