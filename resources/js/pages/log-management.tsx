import { GlassPanel } from '@/components/ui/glass-panel';
import DashboardLayout from '@/layouts/app-dashboard-layout';
import { 
    AlertCircle, 
    ArrowRight, 
    CheckCircle2, 
    Clock, 
    History, 
    MessageSquare, 
    ShieldCheck 
} from 'lucide-react';
import React from 'react';

export default function LogManagement() {
    return (
        <DashboardLayout title="Log Management">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Log Adjustment Center</h1>
                    <p className="text-gray-400">Request log adjustments and maintain accuracy through documented transparency.</p>
                </div>

                <div className="grid grid-cols-5 gap-10">
                    {/* Left Column: Form & Comparison */}
                    <div className="col-span-3 space-y-8">
                        {/* Comparison Card */}
                        <GlassPanel className="p-8 border-primary/20 radial-glow relative overflow-hidden">
                            <div className="absolute top-0 right-10 w-32 h-32 bg-primary/5 blur-2xl rounded-full" />
                            
                            <h3 className="text-xl font-display font-bold mb-6 flex items-center">
                                <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
                                Adjustment Preview
                            </h3>

                            <div className="flex items-center justify-between">
                                {/* Original */}
                                <div className="flex-1 text-center">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Original Log</div>
                                    <div className="text-3xl font-display font-medium text-gray-400 line-through">08:42</div>
                                    <div className="text-xs text-gray-600 mt-1">Automatic Cloud Sync</div>
                                </div>

                                <div className="px-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <ArrowRight className="w-6 h-6 text-primary" />
                                    </div>
                                </div>

                                {/* Proposed */}
                                <div className="flex-1 text-center">
                                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">Proposed Correction</div>
                                    <div className="text-4xl font-display font-bold text-white">08:30</div>
                                    <div className="text-xs text-primary/60 mt-1">Manual Input Request</div>
                                </div>
                            </div>
                        </GlassPanel>

                        {/* Reasoning Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-300">Reasoning & Evidence</label>
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Recommended for 9.0+ Trust</span>
                            </div>
                            <textarea
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm leading-relaxed"
                                placeholder="Explain why this correction is necessary... (e.g., Transit delay, device sync error)"
                            />
                            <div className="flex items-center space-x-3 text-gray-500 bg-white/5 p-4 rounded-xl border border-white/5">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-xs leading-relaxed">System logs confirm proximity at 08:32. This correction falls within the 5-minute trust threshold for automatic approval.</p>
                            </div>
                        </div>

                        <button className="w-full py-5 rounded-2xl bg-primary text-black font-bold text-lg transition-all hover:scale-[1.02] active:scale-98 shadow-lg shadow-primary/20">
                            Submit for Verification
                        </button>
                    </div>

                    {/* Right Column: Information & History */}
                    <div className="col-span-2 space-y-8">
                        {/* Trust Score Card */}
                        <GlassPanel className="p-6">
                            <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Network Trust Index</h3>
                            <div className="flex items-center justify-between items-end mb-4">
                                <h2 className="text-6xl font-display font-bold text-primary tracking-tighter">9.78</h2>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-bold mb-1">Elite Tier</span>
                                    <p className="text-xs text-gray-500">Global Rank #42</p>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[94%]" />
                            </div>
                        </GlassPanel>

                        {/* Recent History */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <History className="w-4 h-4 mr-2" />
                                Recent Requests
                            </h3>
                            <div className="space-y-4">
                                <HistoryItem 
                                    date="Oct 24, 2024" 
                                    status="Approved" 
                                    change="08:45 → 09:00" 
                                    reason="Technical sync error" 
                                />
                                <HistoryItem 
                                    date="Oct 12, 2024" 
                                    status="Approved" 
                                    change="17:30 → 18:00" 
                                    reason="Overtime extension" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function HistoryItem({ date, status, change, reason }: any) {
    return (
        <div className="group p-4 rounded-2xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-500">{date}</p>
                <div className="flex items-center space-x-1 text-[10px] font-bold text-green-400 px-2 py-0.5 bg-green-400/10 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{status}</span>
                </div>
            </div>
            <p className="font-semibold text-sm mb-1">{change}</p>
            <p className="text-xs text-gray-500">{reason}</p>
        </div>
    );
}
