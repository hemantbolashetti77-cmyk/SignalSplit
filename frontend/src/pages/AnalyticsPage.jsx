import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Video, Link as LinkIcon, Clock, ThumbsUp, MessageSquare, Eye, Play, FileText } from 'lucide-react';

const InputField = ({ label, icon, ...props }) => (
    <div style={{ marginBottom: 'var(--space-md)' }}>
        <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '10px', color: 'var(--fg-secondary)' }}>
            {icon} {label}
        </label>
        <input 
            {...props}
            style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-muted)',
                color: 'var(--fg-primary)',
                padding: '12px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--fg-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-muted)'}
        />
    </div>
);

const AnalyticsPage = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [isAutoFetch, setIsAutoFetch] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        videoName: '',
        url: '',
        videoLength: '',
        likes: '',
        comments: '',
        views: '',
        runtime: ''
    });
    const [videoPreview, setVideoPreview] = useState(null);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    // Debounce effect for dynamic extraction
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.url.includes('youtube.com') || formData.url.includes('youtu.be')) {
                const videoId = formData.url.split('v=')[1]?.split('&')[0] || formData.url.split('/').pop();
                setVideoPreview(`https://www.youtube.com/embed/${videoId}`);
                
                if (isAutoFetch && formData.url.length > 20) {
                    fetchYoutubeData(formData.url);
                }
            } else if (formData.url.includes('vimeo.com')) {
                const videoId = formData.url.split('/').pop();
                setVideoPreview(`https://player.vimeo.com/video/${videoId}`);
            } else {
                setVideoPreview(null);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [formData.url, isAutoFetch]);

    const handleUrlChange = (e) => {
        setFormData(prev => ({ ...prev, url: e.target.value }));
    };

    const handleSubmit = async (e, manualData) => {
        if (e) e.preventDefault();
        const dataToSubmit = manualData || formData;
        
        setIsProcessing(true);
        try {
            const res = await axios.post('http://localhost:5000/api/analytics', dataToSubmit, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                navigate(`/report/${res.data.evaluation._id}`);
            }
        } catch (err) {
            console.error('Error saving analytics:', err);
            alert('Failed to save data.');
            setIsProcessing(false);
        }
    };

    const fetchYoutubeData = async (url) => {
        setIsFetching(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/analytics/fetch-video?videoUrl=${encodeURIComponent(url)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const fetchedData = {
                    ...formData,
                    ...res.data.data,
                    url // Ensure URL is latest
                };
                setFormData(fetchedData);
                
                // Auto-generate report if all metadata is found
                if (fetchedData.videoName && fetchedData.views) {
                    setTimeout(() => {
                        handleSubmit(null, fetchedData);
                    }, 1500); // Small delay to let user see the data
                }
            }
        } catch (err) {
            console.error('Auto-fetch failed:', err);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: 'var(--space-xl)', position: 'relative' }}>
            {isProcessing && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(18,19,20,0.9)', 
                    zIndex: 100, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        style={{ width: '40px', height: '40px', border: '2px solid var(--border-muted)', borderTopColor: 'var(--fg-primary)', marginBottom: 'var(--space-md)' }}
                    />
                    <div className="label-caps" style={{ letterSpacing: '0.2em' }}>Executing Analysis Protocol...</div>
                    <div className="mono" style={{ fontSize: '10px', marginTop: '10px', color: 'var(--border-muted)' }}>[ SPLITTING_SIGNAL_FROM_NOISE ]</div>
                </div>
            )}
            <div className="container">
                <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <Link to="/dashboard" style={{ color: 'var(--fg-secondary)', textDecoration: 'none' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <span className="label-caps" style={{ fontSize: '10px' }}>Core Analytics Engine</span>
                        <h1 style={{ fontSize: 'calc(1.5rem + 1vw)', marginTop: '4px' }}>Generate Video Payroll</h1>
                    </div>
                </header>

                <div className="grid-12 mobile-stack" style={{ gap: 'var(--space-xl)' }}>
                    <div className="col-5">
                        <div style={{ 
                            display: 'flex', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--border-muted)', 
                            padding: '4px',
                            marginBottom: 'var(--space-lg)'
                        }}>
                            <button 
                                onClick={() => setIsAutoFetch(true)}
                                className="label-caps"
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: isAutoFetch ? 'var(--fg-primary)' : 'transparent',
                                    color: isAutoFetch ? 'var(--bg-primary)' : 'var(--fg-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                }}
                            >
                                Automation
                            </button>
                            <button 
                                onClick={() => setIsAutoFetch(false)}
                                className="label-caps"
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: !isAutoFetch ? 'var(--fg-primary)' : 'transparent',
                                    color: !isAutoFetch ? 'var(--bg-primary)' : 'var(--fg-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                }}
                            >
                                Manual
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 'var(--space-xl)', transition: 'opacity 0.2s' }}>
                            <InputField 
                                label="Video URL" 
                                icon={<LinkIcon size={14} />} 
                                placeholder="https://youtube.com/..."
                                value={formData.url}
                                onChange={handleUrlChange}
                                required={isAutoFetch}
                            />

                            <div style={{ 
                                margin: 'var(--space-lg) 0', 
                                borderTop: '1px solid var(--border-muted)', 
                                paddingTop: 'var(--space-lg)',
                                opacity: isAutoFetch ? 0.4 : 1,
                                pointerEvents: isAutoFetch ? 'none' : 'auto',
                                maxHeight: isAutoFetch ? '100px' : '1000px',
                                overflow: 'hidden',
                                transition: 'all 0.4s ease'
                            }}>
                                <div className="label-caps" style={{ fontSize: '9px', marginBottom: '16px', color: 'var(--fg-secondary)' }}>
                                    {isAutoFetch ? '[ AUTO_FETCH_MODE: FIELDS_LOCKED ]' : '[ MANUAL_MODE: EDIT_ENABLED ]'}
                                </div>
                                <InputField 
                                    label="Video Name" 
                                    icon={<Video size={14} />} 
                                    placeholder={isAutoFetch ? "Waiting for URL..." : "E.g. Summer Campaign"}
                                    value={formData.videoName}
                                    onChange={(e) => setFormData({ ...formData, videoName: e.target.value })}
                                    required={!isAutoFetch}
                                />
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <InputField 
                                        label="Video Length" 
                                        icon={<Clock size={14} />} 
                                        placeholder="--:--"
                                        value={formData.videoLength}
                                        onChange={(e) => setFormData({ ...formData, videoLength: e.target.value })}
                                    />
                                    <InputField 
                                        label="Actual Runtime" 
                                        icon={<Play size={14} />} 
                                        placeholder="Enter runtime"
                                        value={formData.runtime}
                                        onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                                    <InputField 
                                        label="Likes" 
                                        icon={<ThumbsUp size={14} />} 
                                        type="number"
                                        value={formData.likes}
                                        onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                                    />
                                    <InputField 
                                        label="Comments" 
                                        icon={<MessageSquare size={14} />} 
                                        type="number"
                                        value={formData.comments}
                                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                    />
                                    <InputField 
                                        label="Views" 
                                        icon={<Eye size={14} />} 
                                        type="number"
                                        value={formData.views}
                                        onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-primary" 
                                style={{ 
                                    width: '100%', 
                                    marginTop: 'var(--space-md)', 
                                    padding: '16px',
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                                disabled={isProcessing}
                            >
                                <FileText size={18} style={{ marginRight: '8px' }} /> 
                                {isProcessing ? 'Saving Report...' : 'Generate Report'}
                            </button>
                        </form>
                    </div>

                    <div className="col-7">
                        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span className="label-caps">Dynamic Video Preview</span>
                                <span className="mono" style={{ fontSize: '10px', color: 'var(--border-muted)' }}>STREAM_STATUS: {videoPreview ? 'LINKED' : 'WAITING'}</span>
                            </div>
                            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {videoPreview ? (
                                    <iframe 
                                        src={videoPreview} 
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        title="Video Preview"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: 'var(--border-muted)', marginBottom: 'var(--space-md)' }}>
                                            <Video size={48} strokeWidth={1} />
                                        </div>
                                        <p className="mono" style={{ fontSize: '12px', color: 'var(--border-muted)' }}>
                                            [ INPUT VALID URL TO INITIALIZE STREAM ]
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.01)' }}>
                                <div className="label-caps" style={{ fontSize: '10px', marginBottom: 'var(--space-md)' }}>Metadata Extraction</div>
                                <div className="mono" style={{ fontSize: '11px', color: 'var(--fg-secondary)' }}>
                                    {formData.videoName || '---'} // {formData.videoLength || '--:--'} <br />
                                    V_URL: {formData.url || '---'} <br />
                                    ENGAGEMENT_SIG: {formData.views || 0}V | {formData.likes || 0}L | {formData.comments || 0}C <br />
                                    REAL_USERS: {formData.realViews?.toLocaleString() || 0} ({formData.realUserPercentage || 0}%) <br />
                                    BOT_TRAFFIC: {formData.botViews?.toLocaleString() || 0} <br />
                                    ESTIMATED_REV: ₹{formData.revenue || '0.00'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
