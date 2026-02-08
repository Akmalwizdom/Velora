import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/glass-panel';
import { StatCard } from '@/components/ui/stat-card';
import { PulseItem } from '@/components/ui/pulse-item';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { 
    Activity, 
    ChevronRight, 
    Filter, 
    History, 
    MessageSquare, 
    MoreHorizontal, 
    Play, 
    Search, 
    Send, 
    Share2, 
    ShieldCheck, 
    TrendingUp, 
    Users, 
    Zap,
    HelpCircle,
    Info,
    AlertTriangle,
    Monitor
} from 'lucide-react';
import React from 'react';
import type { TeamAnalyticsProps, TeamMember, PulseFeedItem } from '@/types/attendance';

interface ActiveMember extends TeamMember {
    lat: string | number | null;
    lng: string | number | null;
    location_name?: string;
    check_in: string;
}

interface PageProps extends TeamAnalyticsProps {}

export default function TeamAnalytics({
    stats = { presence: 0, activeNow: 0, remote: 0, lateAbsent: 0 },
    lateMembers = [],
    remoteMembers = [],
    activeMembers = [],
    pulseFeed = [],
    energyFlux = [30, 45, 80, 70, 40, 30, 15, 10]
}: PageProps & { activeMembers?: ActiveMember[] }) {
    // Helper to map lat/lng to map percentages
    // Ideally we boundary this based on office locations, but for now we'll use a simple relative mapping
    const getMapPosition = (lat: any, lng: any, index: number) => {
        if (!lat || !lng) {
            // If no coordinates, space them out pseudo-randomly for aesthetic "distributed" look
            const seed = (index * 137) % 100;
            return {
                top: `${20 + (seed % 60)}%`,
                left: `${10 + ((seed * 7) % 80)}%`
            };
        }
        
        // Simple mapping (example organizational boundary: Indonesia/Jakarta area)
        // Lat: -6.1754, Lng: 106.8272
        const baseLat = -6.1754;
        const baseLng = 106.8272;

        // Anti-overlapping offset: add a small jitter based on index
        const jitterX = (index % 3 - 1) * 2; // -2, 0, or 2
        const jitterY = (Math.floor(index / 3) % 3 - 1) * 2;
        
        // Scale factor to keep nodes within 10-90% range
        const top = 50 - (parseFloat(lat) - baseLat) * 200;
        const left = 50 + (parseFloat(lng) - baseLng) * 200;
        
        return {
            top: `${Math.max(10, Math.min(90, top + jitterY))}%`,
            left: `${Math.max(10, Math.min(90, left + jitterX))}%`
        };
    };
    return (
        <DashboardLayout title="Team Analytics">
            <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-hidden">
                {/* Center Dashboard */}
                <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
                    {/* Page Heading */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Team Presence Overview</h2>
                            <p className="text-muted-dynamics text-base md:text-lg">Real-time visualization of your active workforce.</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button 
                                aria-label="Filter Map View"
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none"
                            >
                                <Filter className="size-4" /> Filter
                            </button>
                            <button 
                                aria-label="Export Insights"
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-background-dark text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all focus-visible:ring-2 focus-visible:ring-white outline-none"
                            >
                                <Share2 className="size-4" /> Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Presence" value={`${stats.presence}%`} trend="+4.2%" trendColor="green" />
                        <StatCard label="Active Now" value={String(stats.activeNow)} subValue="Members" isPrimary />
                        <StatCard label="Remote" value={String(stats.remote)} subValue="Locations" />
                        <StatCard label="Late/Absent" value={String(stats.lateAbsent)} subValue="Today" trend="Action" trendColor="red" />
                    </div>

                    {/* Attendance Snapshot - Workforce Overview */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="size-4 text-orange-400" /> Late / Unaccounted
                                </h3>
                                <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase">{lateMembers.length} Members</span>
                            </div>
                            <div className="space-y-4">
                                {lateMembers.length > 0 ? lateMembers.slice(0, 3).map((member) => (
                                    <TeamMemberRow key={member.id} name={member.name} time={member.time || 'Late'} img={member.avatar} status={member.status || 'late'} />
                                )) : (
                                    <p className="text-xs text-muted-dynamics/60 italic">No late members</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Monitor className="size-4 text-primary" /> Remote Active
                                </h3>
                                <span className="text-[10px] font-bold text-muted-dynamics/40 uppercase">{remoteMembers.length} Members</span>
                            </div>
                            <div className="space-y-4">
                                {remoteMembers.length > 0 ? remoteMembers.slice(0, 3).map((member) => (
                                    <TeamMemberRow key={member.id} name={member.name} time={member.time || 'Remote'} img={member.avatar} status="remote" />
                                )) : (
                                    <p className="text-xs text-muted-dynamics/60 italic">No remote members</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Atmospheric Map Container */}
                    <div className="flex-1 min-h-[400px] md:min-h-[500px] relative rounded-2xl bg-[#0a1214] border border-white/5 overflow-hidden grid-bg">
                        {/* Legend - Simplified to only Active/Remote */}
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2 z-10">
                            <LegendItem color="bg-primary" label="Active Now" active />
                            <LegendItem color="bg-white/10" label="Remote" />
                        </div>

                        {/* Map Visualization (CSS/SVG) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 800 500">
                                <path d="M150,150 L400,300 M400,300 L650,120 M150,150 L200,400 M400,300 L350,100" fill="none" stroke="#13c8ec" strokeWidth="0.5" />
                                <circle cx="150" cy="150" fill="#13c8ec" r="2" />
                                <circle cx="400" cy="300" fill="#13c8ec" r="2" />
                                <circle cx="650" cy="120" fill="#13c8ec" r="2" />
                                
                                {/* Region Context Labels */}
                                <text x="150" y="130" fill="white" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="middle">WEST REGION</text>
                                <text x="400" y="280" fill="white" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="middle">CENTRAL HUB</text>
                                <text x="650" y="100" fill="white" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="middle">EAST SECTOR</text>
                            </svg>
                        </div>

                        {/* Interactive Nodes - Data Driven Presence */}
                        {activeMembers.map((member, idx) => {
                            const pos = getMapPosition(member.lat, member.lng, idx);
                            return (
                                <MapNode 
                                    key={member.id}
                                    top={pos.top} 
                                    left={pos.left} 
                                    name={member.name} 
                                    locationName={member.location_name}
                                    status={member.status === 'remote' ? 'remote' : 'active'} 
                                    img={member.avatar} 
                                />
                            );
                        })}

                        {/* If empty, show a subtle hint */}
                        {activeMembers.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                <p className="text-xs text-muted-dynamics uppercase font-bold tracking-[0.2em]">Waiting for pulses...</p>
                            </div>
                        )}

                        {/* Time Travel Slider */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 md:px-10">
                            <div className="bg-header-background/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 md:p-4 flex items-center gap-4 md:gap-6">
                                <button aria-label="Play Time-lapse" className="text-muted-dynamics hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-full outline-none">
                                    <Play className="size-5 fill-current" />
                                </button>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex justify-between text-[10px] font-bold text-muted-dynamics uppercase tracking-widest">
                                        <span>08:00</span>
                                        <span className="text-primary">14:24 (Live)</span>
                                        <span>20:00</span>
                                    </div>
                                    <div className="relative h-1 bg-white/10 rounded-full">
                                        <div className="absolute inset-y-0 left-0 w-[65%] bg-primary rounded-full" />
                                        <div className="absolute top-1/2 left-[65%] -translate-x-1/2 -translate-y-1/2 size-3 bg-white rounded-full ring-4 ring-primary/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pulse Feed Sidebar */}
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-header-background flex flex-col shrink-0">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                            <Activity className="size-5 text-primary" /> Pulse Feed
                        </h3>
                    </div>
                    <div className="flex-1 flex flex-col p-4 space-y-4">
                        {pulseFeed.length > 0 ? pulseFeed.map((item, index) => (
                            <PulseItem 
                                key={index}
                                type={item.type} 
                                title={item.title} 
                                desc={item.desc}
                                action={item.action}
                                members={item.members}
                            />
                        )) : (
                            <PulseItem 
                                type="warning" 
                                title="No Activity" 
                                desc="No recent pulse activity to display."
                            />
                        )}

                        {/* Activity Trends Chart */}
                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl mt-auto">
                            <p className="text-[10px] font-bold text-muted-dynamics uppercase tracking-widest mb-4 text-center">Activity Trends (24h)</p>
                            <div className="flex items-end justify-between h-16 gap-1">
                                {energyFlux.map((h, i) => (
                                    <div 
                                        key={i} 
                                        style={{ height: `${h}%` }} 
                                        className={cn('w-2 rounded-t transition-all', h > 70 ? 'bg-primary' : 'bg-white/20')} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-white/5">
                        <button className="w-full py-2 bg-white/5 text-white rounded-lg text-sm font-bold hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none">
                            Manage Notifications
                        </button>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}

interface LegendItemProps {
    color: string;
    label: string;
    active?: boolean;
}

function LegendItem({ color, label, active }: LegendItemProps) {
    return (
        <div className="flex items-center gap-2 text-[10px] text-muted-dynamics uppercase font-bold tracking-widest">
            <span className={cn('size-2 rounded-full', color, active && 'orb-glow')} />
            {label}
        </div>
    );
}

interface MapNodeProps {
    top?: string;
    left?: string;
    right?: string;
    name?: string;
    locationName?: string;
    status: 'active' | 'remote';
    img?: string;
    count?: number;
}

function MapNode({ top, left, right, name, locationName, status, img, count }: MapNodeProps) {
    const isActive = status === 'active';
    const isRemote = status === 'remote';

    return (
        <div 
            className="absolute flex flex-col items-center group cursor-pointer" 
            style={{ top, left, right }}
        >
            {count ? (
                <div className="flex -space-x-4">
                    {[1, 2].map(i => (
                        <div key={i} className="size-10 md:size-12 rounded-full border-2 border-[#0a1214] bg-surface-dark overflow-hidden transition-transform group-hover:scale-110">
                            <img src={`https://i.pravatar.cc/150?u=collab${i}`} alt="Collaborator" className="size-full object-cover" />
                        </div>
                    ))}
                    <div className="size-10 md:size-12 rounded-full border-2 border-[#0a1214] bg-surface-dark flex items-center justify-center text-[10px] font-bold text-white group-hover:scale-110 transition-transform">
                        +{count}
                    </div>
                </div>
            ) : (
                <div className={cn(
                    'relative transition-all duration-300 group-hover:scale-110',
                    isRemote ? 'opacity-80' : 'opacity-100'
                )}>
                    <div className={cn(
                        'size-12 md:size-16 rounded-full border flex items-center justify-center p-1 bg-white/5',
                        isActive ? 'border-primary/40 bg-primary/10 orb-glow' : 'border-white/10'
                    )}>
                        <img src={img} className="size-full rounded-full bg-cover" alt={name || "User"} />
                    </div>
                    {isRemote && (
                        <div className="absolute -bottom-1 -right-1 size-4 bg-primary/20 rounded-full border-2 border-[#0a1214] flex items-center justify-center shadow-lg">
                            <Zap className="text-primary size-2.5 fill-current" />
                        </div>
                    )}
                </div>
            )}
            {name && <p className={cn('text-[10px] font-black mt-2 uppercase tracking-tight', isActive ? 'text-primary' : 'text-muted-dynamics')}>{name}</p>}
            {locationName && <p className="text-[8px] font-bold text-muted-dynamics/50 uppercase tracking-tighter">{locationName}</p>}
            {isRemote && !locationName && <p className="text-[9px] font-bold mt-1 text-muted-dynamics uppercase">Remote</p>}
        </div>
    );
}

function TeamMemberRow({ name, time, img, status }: any) {
    return (
        <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-full border border-white/10 overflow-hidden">
                    <img src={img} className="size-full object-cover" alt={name} />
                </div>
                <div>
                    <p className="text-xs font-bold text-white mb-0.5">{name}</p>
                    <p className="text-[10px] text-muted-dynamics/60 font-medium uppercase tracking-tighter">{time}</p>
                </div>
            </div>
            <div className={cn(
                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                status === 'late' ? "bg-orange-500/10 text-orange-400" :
                status === 'absent' ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
            )}>
                {status}
            </div>
        </div>
    );
}


