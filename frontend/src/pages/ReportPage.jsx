import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Share2, CheckCircle2, AlertCircle, Zap, ShieldCheck, Activity, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

const ReportPage = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCopied, setShowCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const reportRef = useRef();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#121314',
                scale: 2,
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SignalSplit_Report_${id}.pdf`);
        } catch (err) {
            console.error('PDF Export Error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // We'll reuse the history endpoint or create a specific one
                const res = await axios.get(`/api/analytics/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const found = res.data.evaluations.find(e => e._id === id);
                setReport(found);
            } catch (err) {
                console.error('Error fetching report:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, token]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="mono" style={{ color: 'var(--fg-primary)' }}>[ INITIALIZING_REPORT_RENDER... ]</div>
        </div>
    );

    if (!report) return <div>Report not found.</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: isMobile ? 'var(--space-md)' : 'var(--space-xl)' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <Link to="/dashboard" style={{ color: 'var(--fg-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> BACK_TO_DASHBOARD
                    </Link>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', position: 'relative' }}>
                        {showCopied && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ 
                                    position: 'absolute', 
                                    top: '-40px', 
                                    right: 0, 
                                    background: '#4ade80', 
                                    color: '#000', 
                                    padding: '4px 12px', 
                                    fontSize: '10px',
                                    fontWeight: '700'
                                }}
                                className="label-caps"
                            >
                                <Check size={10} style={{ marginRight: '4px' }} /> LINK_COPIED
                            </motion.div>
                        )}
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="btn-outline" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '10px', opacity: isExporting ? 0.6 : 1 }}
                        >
                            <Download size={14} /> {isExporting ? 'GENERATING...' : 'EXPORT_PDF'}
                        </button>
                        <button 
                            onClick={handleShare}
                            className="btn-outline" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '10px' }}
                        >
                            <Share2 size={14} /> SHARE_PROTOCOL
                        </button>
                    </div>
                </header>

                <div ref={reportRef} style={{ padding: 'var(--space-md)', margin: '0 -var(--space-md)' }}>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card" 
                    style={{ padding: isMobile ? 'var(--space-md)' : 'var(--space-xl)', border: '1px solid var(--border-muted)', marginBottom: 'var(--space-xl)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', flexDirection: isMobile ? 'column' : 'row', gap: 'var(--space-md)' }}>
                        <div>
                            <span className="label-caps" style={{ color: '#4ade80', fontSize: '10px' }}>● ANALYSIS_COMPLETE</span>
                            <h1 style={{ fontSize: isMobile ? '28px' : '42px', marginTop: '8px', letterSpacing: '-0.04em' }}>{report.videoName}</h1>
                            <p className="mono" style={{ color: 'var(--fg-secondary)', fontSize: '10px' }}>
                                TYPE: <span style={{ color: 'var(--fg-primary)' }}>{report.videoType || 'N/A'}</span> | 
                                V_ID: {report._id} | 
                                TIMESTAMP: {new Date(report.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <div className="label-caps" style={{ fontSize: '10px' }}>Final Signal Fidelity</div>
                            <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: report.fidelity === 'HIGH' ? '#4ade80' : '#fbbf24' }}>
                                {report.fidelity}
                            </div>
                        </div>
                    </div>

                    <div className="grid-12 mobile-stack" style={{ gap: 'var(--space-lg)' }}>
                        <div style={{ gridColumn: 'span 4' }}>
                            <div style={{ padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)' }}>
                                <div className="label-caps" style={{ color: 'var(--fg-secondary)', fontSize: '9px' }}>Efficiency Score</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', margin: '8px 0' }}>{report.efficiency}%</div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                    <div style={{ height: '100%', width: `${report.efficiency}%`, background: '#4ade80' }}></div>
                                </div>
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <div style={{ padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)' }}>
                                <div className="label-caps" style={{ color: 'var(--fg-secondary)', fontSize: '9px' }}>Anomalies Detected</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', margin: '8px 0', color: report.anomalies > 0 ? '#f87171' : '#4ade80' }}>
                                    {report.anomalies}
                                </div>
                                <div className="mono" style={{ fontSize: '9px', color: 'var(--border-muted)' }}>
                                    {report.anomalies > 0 ? 'INTERFERENCE_FOUND' : 'NO_NOISE_DETECTED'}
                                </div>
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <div style={{ padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)' }}>
                                <div className="label-caps" style={{ color: 'var(--fg-secondary)', fontSize: '9px' }}>System Latency</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', margin: '8px 0' }}>{report.latency}ms</div>
                                <div className="mono" style={{ fontSize: '9px', color: 'var(--border-muted)' }}>OPTIMIZED_NODE</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid-12 mobile-stack" style={{ gap: 'var(--space-xl)' }}>
                    <div className="col-7">
                        <h3 className="label-caps" style={{ marginBottom: 'var(--space-lg)' }}>Extracted Signal Metadata</h3>
                        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {[
                                        { label: 'Video URL', value: report.url },
                                        { label: 'Raw Duration', value: report.videoLength },
                                        { label: 'Total Views', value: report.views?.toLocaleString() },
                                        { label: 'Followers / Subs', value: report.followers?.toLocaleString() },
                                        { label: 'Quality Signal', value: `${report.realUserPercentage}%` },
                                        { label: 'Dampened Reach', value: `${Math.round(Math.sqrt(report.realViews || 0) * (report.realUserPercentage / 100) * 10).toLocaleString()} pts` },
                                        { label: 'Real Users', value: report.realViews?.toLocaleString() },
                                        { label: 'Bot Traffic', value: report.botViews?.toLocaleString() },
                                        { label: 'Engagement Likes', value: report.likes?.toLocaleString() },
                                        { label: 'Comments Count', value: report.comments?.toLocaleString() },
                                        { label: 'Capital Protected', value: `₹${parseFloat(report.fraudSavings || 0).toLocaleString()}`, isHighlight: true },
                                        { label: 'Generated Revenue', value: `₹${parseFloat(report.revenue || 0).toLocaleString()}` }
                                    ].map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                                            <td className="label-caps" style={{ padding: '12px 0', fontSize: '9px', color: row.isHighlight ? '#4ade80' : 'var(--fg-secondary)' }}>{row.label}</td>
                                            <td className="mono" style={{ padding: '12px 0', fontSize: row.isHighlight ? '14px' : '12px', textAlign: 'right', color: row.isHighlight ? '#4ade80' : 'inherit', fontWeight: row.isHighlight ? '700' : 'normal' }}>{row.value || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-5">
                        <h3 className="label-caps" style={{ marginBottom: 'var(--space-lg)' }}>User Authenticity</h3>
                        <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span className="label-caps" style={{ fontSize: '10px' }}>Real Users</span>
                                <span className="mono" style={{ fontSize: '10px' }}>{report.realUserPercentage}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(248, 113, 113, 0.2)', position: 'relative', marginBottom: 'var(--space-md)' }}>
                                <div style={{ height: '100%', width: `${report.realUserPercentage}%`, background: '#4ade80' }}></div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#4ade80' }}></div>
                                    <span className="mono">REAL: {report.realViews?.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#f87171' }}></div>
                                    <span className="mono">BOT: {report.botViews?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <h3 className="label-caps" style={{ marginBottom: 'var(--space-lg)' }}>Cleansing Insights</h3>
                        <div className="glass-card" style={{ padding: 'var(--space-xl)', background: 'rgba(74, 222, 128, 0.02)', marginBottom: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <Zap size={20} style={{ color: '#4ade80' }} />
                                <div>
                                    <div className="label-caps" style={{ fontSize: '10px' }}>Optimization Path</div>
                                    <p style={{ fontSize: '13px', color: 'var(--fg-secondary)', marginTop: '4px' }}>
                                        The signal split was executed with {report.efficiency}% precision. 
                                        {report.videoType === 'SHORT_FORM' 
                                            ? ' Strict full-view retention protocol applied (Short-form).' 
                                            : ' Minimum 30s viewing threshold applied (Long-form).'} 
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <ShieldCheck size={20} style={{ color: '#4ade80' }} />
                                <div>
                                    <div className="label-caps" style={{ fontSize: '10px' }}>Security Protocol</div>
                                    <p style={{ fontSize: '13px', color: 'var(--fg-secondary)', marginTop: '4px' }}>
                                        End-to-end encryption maintained throughout the evaluation process. Data integrity verified.
                                    </p>
                                </div>
                            </div>
                            
                            {report.analysisReasons && report.analysisReasons.length > 0 && (
                                <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                                    <div className="label-caps" style={{ fontSize: '10px', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={12} /> ANOMALY_REPORTS
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--fg-secondary)', fontSize: '11px' }}>
                                        {report.analysisReasons.map((reason, i) => (
                                            <li key={i} className="mono" style={{ marginBottom: '4px' }}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <h3 className="label-caps" style={{ marginBottom: 'var(--space-lg)' }}>Logic Shield v2.4</h3>
                        <div className="glass-card" style={{ padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.01)' }}>
                            <div className="mono" style={{ fontSize: '10px', color: 'var(--fg-secondary)' }}>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
                                    <span style={{ color: '#4ade80' }}>[ ACTIVE ]</span> RAW_VIEW_INFLATION_PROTECTION: SQRT_DAMPENING
                                </div>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
                                    <span style={{ color: '#4ade80' }}>[ ACTIVE ]</span> BOT_LIKE_RATIO_SENTRY: 8X_SPIKE_DETECTION
                                </div>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
                                    <span style={{ color: '#4ade80' }}>[ ACTIVE ]</span> TRAFFIC_SKEW_CORRECTION: LOG_EQUIVALENT_SCALE
                                </div>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
                                    <span style={{ color: '#4ade80' }}>[ ACTIVE ]</span> FOLLOWER_GRAPH_SENTRY: NETWORK_TRAFFICKING_CHECK
                                </div>
                                <div style={{ marginBottom: '0' }}>
                                    <span style={{ color: '#4ade80' }}>[ ACTIVE ]</span> FLOOR_FAIRNESS_GUARANTEE: MIN_PAYOUT_LOCK
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
