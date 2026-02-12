import React, { useState, useEffect } from 'react';
import { predictionService, authService } from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Activity, Zap, AlertTriangle, CheckCircle,
    Settings, LogOut, RefreshCw, Cpu
} from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await predictionService.getPrediction();
            setData(result);
            setHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), val: result.efficiency }].slice(-10));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-slate-200 p-6">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 bg-surface/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Cpu className="text-primary w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider">Production Monitor</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => authService.logout()}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl border border-red-500/20 transition-all font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Overall Efficiency"
                    value={`${data?.efficiency}%`}
                    icon={<Zap className="w-6 h-6 text-yellow-500" />}
                    trend="+2.4%"
                    color="yellow"
                />
                <StatCard
                    title="Downtime Risk"
                    value={`${data?.downtime_probability}%`}
                    icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
                    trend="-0.5%"
                    color="red"
                />
                <StatCard
                    title="System Status"
                    value={data?.status}
                    icon={<CheckCircle className="w-6 h-6 text-green-500" />}
                    trend="Stable"
                    color="green"
                />
                <StatCard
                    title="Active Nodes"
                    value="12/12"
                    icon={<Activity className="w-6 h-6 text-primary" />}
                    trend="100%"
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-surface p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Real-time Efficiency Analytics
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                />
                                <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEff)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-surface p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-accent" />
                        AI Insights
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-sm text-primary mb-1 font-medium italic">Recommendation</p>
                            <p className="text-white">{data?.recommendation}</p>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                            <p className="text-sm text-slate-400 mb-1">Predictive Analysis</p>
                            <p className="text-sm">Based on current vibration patterns, maintenance is recommended in 48 hours to avoid potential downtime.</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <button className="w-full bg-surface hover:bg-white/5 py-3 rounded-xl text-sm font-medium border border-white/10 transition-all">
                                Download Full Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="bg-surface p-6 rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 bg-${color}-500/10 rounded-2xl group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
                {trend}
            </span>
        </div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
);

export default Dashboard;
