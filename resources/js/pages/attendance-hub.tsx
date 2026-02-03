import { GlassPanel } from '@/components/ui/glass-panel';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { 
    Clock, 
    Link as LinkIcon, 
    MoreVertical, 
    RotateCcw, 
    ShieldCheck, 
    Zap 
} from 'lucide-react';
import React from 'react';

export default function AttendanceHub() {
    return (
        <DashboardLayout title="Attendance Hub" slimSidebar={true}>
            <div className="max-w-4xl mx-auto pt-10">
                {/* Top Nav / Breadcrumbs */}
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Platform</span>
                        <span className="text-gray-700">/</span>
                        <span className="text-white font-medium">Intelligent Hub</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-colors">
                            <RotateCcw className="w-3 h-3" />
                            <span>Cloud Sync: Active</span>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Chronometer Section */}
                <div className="flex flex-col items-center justify-center mb-24">
                    <div className="relative mb-12">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150" />
                        
                        {/* Chronometer Circle */}
                        <div className="relative w-80 h-80 rounded-full glass-panel flex items-center justify-center border-primary/20 p-4">
                            {/* Inner Ring */}
                            <div className="absolute inset-4 rounded-full border border-white/5" />
                            
                            {/* SVG Progress Arc */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="160"
                                    cy="160"
                                    r="150"
                                    className="stroke-primary"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray="942"
                                    strokeDashoffset="200"
                                    strokeLinecap="round"
                                    style={{ transform: 'scale(0.5) translate(160px, 160px)' }}
                                />
                            </svg>

                            <div className="text-center relative z-10">
                                <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2">Session Active</p>
                                <h1 className="text-7xl font-display font-medium tracking-tighter">08:42</h1>
                                <p className="text-sm text-gray-500 mt-2">March 04, 2024</p>
                            </div>

                            {/* Floating Orbs */}
                            <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-primary orb-glow border-2 border-background-dark animate-bounce" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-display font-bold mb-4 text-center">Ready for alignment?</h2>
                    <p className="text-gray-400 text-center mb-10 max-w-md">Our neural attendance engine has detected your proximity. Initiate core check-in to begin your session.</p>

                    <button className="relative group px-12 py-5 rounded-2xl bg-primary text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(19,200,236,0.3)]">
                        <span className="relative z-10 flex items-center">
                            <Zap className="w-5 h-5 mr-3 fill-current" />
                            Initiate Check-in
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 linear" />
                    </button>
                </div>

                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-3 gap-6">
                    <HubStat label="Efficiency Hub" value="98.2%" icon={Zap} />
                    <HubStat label="Trust Score" value="9.4" icon={ShieldCheck} />
                    <HubStat label="Consistency" value="High" icon={Clock} />
                </div>
            </div>
        </DashboardLayout>
    );
}

function HubStat({ label, value, icon: Icon }: any) {
    return (
        <GlassPanel className="p-5 flex items-center space-x-4 border-white/5 hover:border-white/20 transition-all">
            <div className="p-3 rounded-xl bg-white/5">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{label}</p>
                <p className="text-xl font-display font-bold">{value}</p>
            </div>
        </GlassPanel>
    );
}
