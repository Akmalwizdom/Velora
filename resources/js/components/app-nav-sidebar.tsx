import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { HelpCircle, LayoutGrid, Settings, Shield, User, Zap } from 'lucide-react';
import React from 'react';

const navItems = [
    { name: 'Analytics', icon: LayoutGrid, href: '/team-analytics' },
    { name: 'Attendance', icon: Zap, href: '/attendance-hub' },
    { name: 'Log Manager', icon: Shield, href: '/log-management' },
    { name: 'Performance', icon: User, href: '/performance' },
];

const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Help', icon: HelpCircle, href: '/help' },
];

export function AppNavSidebar({ slim = false }: { slim?: boolean }) {
    const { url } = usePage();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen glass-panel z-50 transition-all duration-300 flex flex-col',
                slim ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="p-6 mb-8 flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center orb-glow">
                    <Zap className="text-black w-6 h-6 fill-current" />
                </div>
                {!slim && <span className="ml-3 font-display font-bold text-xl tracking-tight uppercase tracking-widest">Analytics</span>}
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-3 space-y-2">
                {navItems.map((item) => {
                    const active = url.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative',
                                active ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5',
                                slim && 'justify-center'
                            )}
                        >
                            <item.icon className={cn('w-5 h-5', active ? 'text-primary' : 'text-gray-400 group-hover:text-white')} />
                            {!slim && <span className="ml-3 font-medium">{item.name}</span>}
                            {active && !slim && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
                            
                            {/* Tooltip for slim mode */}
                            {slim && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Nav */}
            <div className="px-3 py-6 border-t border-white/5 space-y-2">
                {bottomItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex items-center px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group relative',
                            slim && 'justify-center'
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {!slim && <span className="ml-3 font-medium">{item.name}</span>}
                    </Link>
                ))}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5">
                <div className={cn('flex items-center', slim ? 'justify-center' : 'p-2 rounded-xl bg-white/5')}>
                    <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden ring-4 ring-primary/10">
                         <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=13c8ec&color=0a0b0d" alt="User" />
                    </div>
                    {!slim && (
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">Alex Rivera</p>
                            <p className="text-xs text-gray-500 truncate">Senior Lead</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
