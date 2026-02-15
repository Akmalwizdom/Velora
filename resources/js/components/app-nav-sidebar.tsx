import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Settings, Zap, Users, Clock, Monitor, ClipboardCheck, CalendarDays } from 'lucide-react';
import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

export function AppNavSidebar({ slim = false }: { slim?: boolean }) {
    const { url, props } = usePage();
    const auth = props.auth as any;
    const role = auth?.user?.role_name;
    const { state, isMobile } = useSidebar();

    const isManagerOrAdmin = role === 'admin' || role === 'manager';

    const filteredNavItems = [
        // QR Station — admin/manager only
        ...(isManagerOrAdmin
            ? [{ name: 'Station Absensi', href: '/qr/display', icon: Monitor }]
            : []),
        // Absensi — all roles
        { name: 'Absensi', icon: Zap, href: '/attendance-hub' },
        // Dashboard — admin/manager only
        ...(isManagerOrAdmin
            ? [{ name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' }]
            : []),
        // Kehadiran Saya — all roles
        { name: 'Kehadiran Saya', icon: CalendarDays, href: '/my-attendance' },
        // Koreksi — admin/manager only
        ...(isManagerOrAdmin
            ? [{ name: 'Koreksi', icon: ClipboardCheck, href: '/corrections' }]
            : []),
        // Admin Management
        ...(role === 'admin'
            ? [
                  { name: 'Kelola Pengguna', href: '/admin/users', icon: Users },
                  { name: 'Jadwal Kerja', href: '/admin/work-schedules', icon: Clock },
              ]
            : []),
    ];

    const isCollapsed = state === 'collapsed' && !isMobile;

    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar-background">
            <SidebarHeader className={cn('p-6 transition-all duration-300', isCollapsed && 'p-4 flex justify-center')}>
                <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark shrink-0">
                        <Zap className="size-5 fill-current" />
                    </div>
                    {state === 'expanded' && (
                        <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                            <h1 className="text-white text-base font-bold leading-tight uppercase tracking-tight truncate">Velora</h1>
                            <p className="text-muted-dynamics text-xs font-normal truncate">Attendance System</p>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className={cn("px-4 py-2 transition-all duration-300", isCollapsed && "px-0")}>
                <SidebarMenu className={cn("gap-2", isCollapsed && "items-center")}>
                    {filteredNavItems.map((item) => {
                        const active = url.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={item.name}
                                    className={cn(
                                        'h-12 px-3 rounded-xl transition-all duration-200 group bg-transparent focus-visible:ring-2 focus-visible:ring-primary outline-none',
                                        isCollapsed && 'px-0 justify-center h-12 w-12',
                                        !isCollapsed && active && 'bg-primary/10 text-primary font-bold shadow-[0_4px_12px_rgba(19,200,236,0.15)] hover:bg-primary/20',
                                        !isCollapsed && !active && 'text-muted-dynamics hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <Link href={item.href} className="flex items-center gap-3 w-full">
                                        <item.icon className={cn('size-7 shrink-0', active ? 'text-primary' : 'text-muted-dynamics group-hover:text-white')} />
                                        {state === 'expanded' && <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className={cn('p-4 flex flex-col gap-4 transition-all duration-300', isCollapsed && 'px-2 py-4')}>
                <SidebarMenu className={cn('gap-1 border-t border-white/5 pt-4', isCollapsed && 'items-center')}>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Settings"
                            className={cn(
                                "h-12 px-3 text-muted-dynamics hover:bg-white/5 hover:text-white rounded-lg focus-visible:ring-2 focus-visible:ring-primary outline-none translate-x-1",
                                isCollapsed && "translate-x-0 mx-auto px-0 justify-center h-12 w-12"
                            )}
                        >
                            <Link href="/settings" className="flex items-center gap-3">
                                <Settings className="size-7 shrink-0" />
                                {state === 'expanded' && <span className="text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">Settings</span>}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
