import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { HelpCircle, LayoutGrid, Settings, Shield, User, Zap, UserPlus } from 'lucide-react';
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

const navItems = [
    { name: 'Overview', icon: LayoutGrid, href: '/team-analytics' },
    { name: 'Attendance', icon: Zap, href: '/attendance-hub' },
    { name: 'Compliance', icon: Shield, href: '/log-management' },
    { name: 'Performance', icon: User, href: '/performance' },
];

const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Help', icon: HelpCircle, href: '/help' },
];

export function AppNavSidebar({ slim = false }: { slim?: boolean }) {
    const { url } = usePage();
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === 'collapsed' && !isMobile;

    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar-background">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark shrink-0">
                        <Zap className="size-5 fill-current" />
                    </div>
                    {state === 'expanded' && (
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-white text-base font-bold leading-tight uppercase tracking-tight truncate">Dynamics</h1>
                            <p className="text-muted-dynamics text-xs font-normal truncate">Remote HQ</p>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4 py-2">
                <SidebarMenu className="gap-2">
                    {navItems.map((item) => {
                        const active = url.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={item.name}
                                    className={cn(
                                        'h-11 px-3 rounded-xl transition-all duration-200 group bg-transparent focus-visible:ring-2 focus-visible:ring-primary outline-none',
                                        active 
                                            ? 'bg-primary/10 text-primary font-bold shadow-[0_4px_12px_rgba(19,200,236,0.15)] hover:bg-primary/20' 
                                            : 'text-muted-dynamics hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <Link href={item.href} className="flex items-center gap-3 w-full">
                                        <item.icon className={cn('size-5 shrink-0', active ? 'text-primary' : 'text-muted-dynamics group-hover:text-white')} />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 flex flex-col gap-4">
                {state === 'expanded' && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mx-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-dynamics mb-2 font-black">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(19,200,236,0.6)]"></div>
                            <p className="text-xs text-white font-bold">Live Sync Active</p>
                        </div>
                    </div>
                )}
                
                <button 
                    aria-label="Invite new team member"
                    className={cn(
                        "w-full py-3 bg-primary text-background-dark rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(19,200,236,0.3)] transition-all active:scale-95 mb-2",
                        isCollapsed && "size-10 p-0 rounded-lg"
                    )}
                >
                    <UserPlus className="size-4" />
                    {state === 'expanded' && "Invite Member"}
                </button>
                
                <SidebarMenu className="gap-1 border-t border-white/5 pt-4">
                    {bottomItems.map((item) => (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.name}
                                className="h-10 px-3 text-muted-dynamics hover:bg-white/5 hover:text-white rounded-lg focus-visible:ring-2 focus-visible:ring-primary outline-none translate-x-1"
                            >
                                <Link href={item.href} className="flex items-center gap-3">
                                    <item.icon className="size-4 shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
