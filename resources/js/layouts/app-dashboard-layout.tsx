import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { AppNavSidebar } from '../components/app-nav-sidebar';
import { AppShell } from '../components/app-shell';
import type { SharedData } from '@/types';

import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    slimSidebar?: boolean;
}

export default function DashboardLayout({ children, title, slimSidebar = false }: DashboardLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const role = (user as any).role || 'Member';

    return (
        <AppShell variant="sidebar">
            <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans selection:bg-primary selection:text-black dark">
                <Head title={title} />
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 grid-bg opacity-30" />
            </div>

            <AppNavSidebar slim={slimSidebar} />

            <main className="flex-1 flex flex-col min-h-0 relative z-10">
                {/* Top Navigation */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-header-background/50 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <SidebarTrigger />
                        <label className="hidden md:flex items-center w-full max-w-md h-9 bg-white/5 rounded-lg border border-white/5 px-3 gap-2 group focus-within:border-primary/30 transition-all cursor-text">
                            <Search className="size-5 text-muted-dynamics group-focus-within:text-primary transition-colors" />
                            <input 
                                aria-label="Cari rekan tim atau departemen"
                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-500 text-white outline-none" 
                                placeholder="Cari rekan tim..." 
                                type="text"
                            />
                        </label>
                        {/* Mobile Search Button */}
                        <button 
                            aria-label="Cari"
                            className="md:hidden size-9 flex items-center justify-center rounded-lg bg-white/5 text-muted-dynamics hover:text-white"
                        >
                            <Search className="size-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <button 
                                aria-label="Notifikasi"
                                className="size-9 flex items-center justify-center rounded-lg bg-white/5 text-muted-dynamics hover:text-white transition-all relative focus-visible:ring-2 focus-visible:ring-primary outline-none"
                            >
                                <Bell className="size-5" />
                                <span className="absolute top-2.5 right-2.5 size-1.5 bg-primary rounded-full ring-2 ring-header-background" aria-hidden="true"></span>
                            </button>
                            <button 
                                aria-label="Bantuan"
                                className="size-9 flex items-center justify-center rounded-lg bg-white/5 text-muted-dynamics hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none"
                            >
                                <HelpCircle className="size-5" />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-white/5 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                                <p className="text-[9px] text-primary uppercase font-black tracking-widest">{role}</p>
                            </div>
                            <button 
                                aria-label="Profil Pengguna"
                                className="size-10 rounded-full border-2 border-primary/30 p-0.5 hover:border-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none overflow-hidden"
                            >
                                <img 
                                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                                    className="size-full rounded-full object-cover" 
                                    alt={user.name} 
                                />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {children}
                </div>
            </main>
        </div>
    </AppShell>
);
}
