import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Shield, Cpu, LogOut, BarChart3, Database, Plus, History, Menu, X } from 'lucide-react';

const SidebarItem = ({ icon, label, active = false, onClick }) => (
    <div 
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            padding: 'var(--space-md)',
            color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
            borderLeft: active ? '2px solid var(--fg-primary)' : '2px solid transparent',
            cursor: 'pointer'
        }}>
        {icon}
        <span className="label-caps" style={{ fontSize: '11px' }}>{label}</span>
    </div>
);

const StatCard = ({ label, value, subtext, onClick }) => (
    <div 
        onClick={onClick}
        className="glass-card" 
        style={{ 
            padding: 'var(--space-md) var(--space-lg)', 
            border: '1px solid var(--border-muted)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'border-color 0.2s ease'
        }}
        onMouseEnter={(e) => onClick && (e.currentTarget.style.borderColor = 'var(--fg-primary)')}
        onMouseLeave={(e) => onClick && (e.currentTarget.style.borderColor = 'var(--border-muted)')}
    >
        <span className="label-caps" style={{ 
            fontSize: '9px', 
            color: 'var(--fg-secondary)', 
            display: 'block', 
            marginBottom: '4px',
            opacity: 0.8
        }}>{label}</span>
        <div style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
        }}>
            {value}
        </div>
        {subtext && (
            <div className="mono" style={{ 
                fontSize: '9px', 
                color: 'var(--border-muted)', 
                marginTop: '4px',
                letterSpacing: '0.05em'
            }}>
                {subtext}
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [evaluations, setEvaluations] = useState([]);
    const [stats, setStats] = useState({
        totalPayrolls: 0,
        totalAnomalies: 0,
        avgEfficiency: 0,
        avgLatency: 0,
        totalRealViews: 0,
        totalBotViews: 0,
        totalRevenue: 0,
        totalFraudSavings: 0
    });
    const [poolConfig, setPoolConfig] = useState({
        totalBudget: 0,
        remainingBudget: 0,
        poolName: '...'
    });
    const [view, setView] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [historyRes, statsRes] = await Promise.all([
                    axios.get('/api/analytics/history', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('/api/analytics/stats', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setEvaluations(historyRes.data.evaluations);
                setStats(statsRes.data.stats);
                setPoolConfig(statsRes.data.config);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [token]);

    if (!user) return <Navigate to="/login" />;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative' }}>
            {/* Sidebar Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 90 }} 
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '240px',
                borderRight: '1px solid var(--border-muted)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: isMobile ? 'absolute' : 'sticky',
                left: isMobile && !isSidebarOpen ? '-240px' : '0',
                zIndex: 100,
                background: 'var(--bg-primary)',
                transition: 'left 0.3s ease',
                top: 0
            }}>
                <div style={{ padding: 'var(--space-xl) var(--space-md)', textAlign: 'center', position: 'relative' }}>
                    <h2 style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>SIGNALSPLIT</h2>
                    <div className="mono" style={{ fontSize: '8px', color: '#4ade80', marginTop: '4px' }}>[ HACKATHON_EDITION_V2.5 ]</div>
                    {isMobile && (
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', color: 'var(--fg-secondary)' }}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
                
                <div style={{ flex: 1 }}>
                    <SidebarItem 
                        icon={<Activity size={18} />} 
                        label="Overview" 
                        active={view === 'overview'} 
                        onClick={() => setView('overview')}
                    />
                    <SidebarItem 
                        icon={<Database size={18} />} 
                        label="History" 
                        active={view === 'history'} 
                        onClick={() => setView('history')}
                    />
                </div>

                <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                        <img src={user.picture} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '0' }} />
                        <div style={{ textAlign: 'left' }}>
                            <div className="label-caps" style={{ fontSize: '10px' }}>{user.name}</div>
                            <div className="mono" style={{ fontSize: '8px', color: 'var(--border-muted)' }}>AUTH_ACTIVE</div>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-muted)',
                            color: 'var(--fg-secondary)',
                            width: '100%',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer'
                        }}
                        className="label-caps"
                    >
                        <LogOut size={14} /> SIGN_OUT
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: isMobile ? 'var(--space-md)' : 'var(--space-xl)', height: '100vh', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-end', marginBottom: 'var(--space-xl)', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', color: 'var(--fg-primary)' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <div>
                            <span className="label-caps" style={{ color: 'var(--fg-secondary)', fontSize: '10px' }}>System Protocol // {view.toUpperCase()}</span>
                            <h1 style={{ fontSize: isMobile ? '24px' : '32px', marginTop: 'var(--space-sm)' }}>{view === 'overview' ? 'Command Center' : 'Evaluation Archive'}</h1>
                        </div>
                    </div>
                    {view === 'overview' && (
                        <button 
                            onClick={() => navigate('/analytics')}
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: isMobile ? '10px 16px' : '12px 24px', fontSize: isMobile ? '10px' : '14px' }}
                        >
                            <Plus size={isMobile ? 14 : 18} /> {isMobile ? 'New' : 'Generate a payroll'}
                        </button>
                    )}
                </header>

                {view === 'overview' ? (
                    <div className="grid-12 mobile-stack" style={{ gap: 'var(--space-md)' }}>
                        {/* REVENUE POOL SECTION */}
                        <div className="col-12 glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', background: 'rgba(74, 222, 128, 0.03)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <span className="label-caps" style={{ fontSize: '10px', color: '#4ade80' }}>Global Revenue Pool: {poolConfig.poolName}</span>
                                    <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>₹{poolConfig.remainingBudget?.toLocaleString()} <span style={{ fontSize: '12px', opacity: 0.5 }}>/ ₹{poolConfig.totalBudget?.toLocaleString()}</span></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="label-caps" style={{ fontSize: '10px' }}>Pool Usage</span>
                                    <div className="mono" style={{ fontSize: '12px', marginTop: '4px' }}>{((1 - (poolConfig.remainingBudget / poolConfig.totalBudget)) * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(poolConfig.remainingBudget / poolConfig.totalBudget) * 100}%` }}
                                    style={{ height: '100%', background: '#4ade80' }}
                                />
                            </div>
                        </div>

                        <div className="col-4">
                            <StatCard 
                                label="Total Fraud Savings" 
                                value={`₹${stats.totalFraudSavings ? stats.totalFraudSavings.toLocaleString() : '0'}`} 
                                subtext="PROTECTED_CAPITAL"
                                onClick={() => {}}
                            />
                        </div>
                        <div className="col-4">
                            <StatCard 
                                label="Anomalies Blocked" 
                                value={stats.totalAnomalies} 
                                subtext="SHIELD_ACTIVE"
                            />
                        </div>
                        <div className="col-4">
                            <StatCard 
                                label="Signal Integrity" 
                                value={stats.avgEfficiency ? `${stats.avgEfficiency.toFixed(1)}%` : '0%'} 
                                subtext="VERIFICATION_PRECISION"
                            />
                        </div>
                        <div className="col-3">
                            <StatCard 
                                label="Real Users" 
                                value={stats.totalRealViews ? stats.totalRealViews.toLocaleString() : '0'} 
                                subtext="VERIFIED_SIG"
                            />
                        </div>
                        <div className="col-3">
                            <StatCard 
                                label="Bot Traffic" 
                                value={stats.totalBotViews ? stats.totalBotViews.toLocaleString() : '0'} 
                                subtext="FILTERED_NOISE"
                            />
                        </div>
                        <div className="col-6">
                            <StatCard 
                                label="Disbursed Revenue" 
                                value={`₹${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}`} 
                                subtext="NET_PAYROLL_DISTRIBUTED"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                        <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                            <span className="label-caps">Previous History Archive</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {evaluations.length > 0 ? (
                                evaluations.map((ev) => (
                                    <div 
                                        key={ev._id} 
                                        onClick={() => navigate(`/report/${ev._id}`)}
                                        style={{ 
                                            padding: 'var(--space-md)', 
                                            border: '1px solid var(--border-muted)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(255,255,255,0.01)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--fg-primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-muted)'}
                                    >
                                        <div>
                                            <div className="mono" style={{ fontSize: '14px', fontWeight: '600' }}>{ev.videoName}</div>
                                            <div className="mono" style={{ fontSize: '10px', color: 'var(--border-muted)' }}>
                                                ID: {ev._id} | DATE: {new Date(ev.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="label-caps" style={{ 
                                            fontSize: '10px', 
                                            padding: '4px 12px', 
                                            background: 'rgba(74, 222, 128, 0.1)', 
                                            color: '#4ade80',
                                            border: '1px solid #4ade80'
                                        }}>
                                            {ev.status.toUpperCase()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--border-muted)' }}>
                                    <History size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
                                    <p className="mono" style={{ fontSize: '12px' }}>[ NO_EVALUATION_HISTORY_FOUND ]</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
