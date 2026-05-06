const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const SystemConfig = require('../models/SystemConfig');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const mongoose = require('mongoose');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

// Helper to get or initialize system config
const getSystemConfig = async () => {
    let config = await SystemConfig.findOne();
    if (!config) {
        config = new SystemConfig();
        await config.save();
    }
    return config;
};

// Helper to format ISO 8601 duration (PT1M30S) to mm:ss
const formatDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    let result = '';
    if (hours > 0) result += hours + ':';
    result += (minutes < 10 && hours > 0 ? '0' : '') + minutes + ':';
    result += (seconds < 10 ? '0' : '') + seconds;
    return result;
};

// Helper to convert runtime to minutes for revenue calculation
const getDurationInMinutes = (runtimeStr) => {
    if (!runtimeStr) return 0;
    
    // Handle ISO 8601 (PT1H2M3S)
    if (runtimeStr.startsWith('PT')) {
        const match = runtimeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        return (hours * 60) + minutes + (seconds / 60);
    }
    
    // Handle mm:ss or hh:mm:ss
    const parts = runtimeStr.split(':').map(Number);
    if (parts.length === 3) {
        return (parts[0] * 60) + parts[1] + (parts[2] / 60);
    } else if (parts.length === 2) {
        return parts[0] + (parts[1] / 60);
    }
    
    return parseFloat(runtimeStr) || 0;
};

// Middleware to verify token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Helper to analyze video stats for anomalies
const analyzeVideoStats = (stats, config) => {
    const views = parseInt(stats.views) || 0;
    const likes = parseInt(stats.likes) || 0;
    const comments = parseInt(stats.comments) || 0;
    const followers = parseInt(stats.followers) || 0;
    const durationInSeconds = getDurationInMinutes(stats.videoLength) * 60;
    const isShortForm = durationInSeconds <= 60 && durationInSeconds > 0;
    
    let anomalies = 0;
    let reasons = [];

    // 1. Core Engagement Anomalies
    if (views > 100 && likes > views) {
        anomalies += 2;
        reasons.push('IMPOSSIBLE_ENGAGEMENT: LIKES > VIEWS');
    }

    // --- NEW LOGIC: BOT LIKE SPIKE DETECTION ---
    const likeRatio = views > 0 ? (likes / views) : 0;
    const commentRatio = views > 0 ? (comments / views) : 0;
    if (likeRatio > 0.32 && commentRatio < 0.01) {
        anomalies += 2.5;
        reasons.push('BOT_LIKE_SPIKE: UNNATURAL_LIKE_RATIO_WITHOUT_ENGAGEMENT');
    }

    // 2. Retention Rules
    if (isShortForm) {
        const interactionRate = (likes + comments) / views;
        if (interactionRate < 0.01 && views > 500) {
            anomalies += 1.5;
            reasons.push('SHORT_FORM_RETENTION_FAILURE: FULL_VIEW_REQUIREMENT_NOT_MET');
        }
    } else {
        if (views > 1000 && (likes + comments) < (views * 0.005)) {
            anomalies += 1.2;
            reasons.push('LONG_FORM_ABANDONMENT: <30S_ESTIMATED_RETENTION');
        }
    }

    if (views > 100000 && (likes + comments) < 10) {
        anomalies += 2;
        reasons.push('HIGH_VIEW_LOW_INTERACTION: GHOST_TRAFFIC');
    }

    // --- NEW LOGIC: FOLLOWER & NETWORK TRAFFICKING ANALYSIS ---
    if (views > 5000 && followers < (views * 0.0001)) {
        anomalies += 1.8;
        reasons.push('FOLLOWER_GHOSTING: UNNATURALLY_LOW_SUBSCRIBER_BASE_FOR_TRAFFIC_VOLUME');
    }

    if (followers > 10000 && views < (followers * 0.01) && views > 0) {
        anomalies += 1.3;
        reasons.push('INACTIVE_BASE: HIGH_FOLLOWER_COUNT_WITH_NEGLIGIBLE_ENGAGEMENT_NETWORK');
    }

    if (views > 0 && (likes + comments + (followers * 0.1)) / views < 0.001) {
        anomalies += 2.1;
        reasons.push('TRAFFIC_INCONGRUENCE: VIEW_VELOCITY_OUTPACES_SOCIAL_GRAPH');
    }

    let basePercentage = isShortForm ? 94 : 98;
    const penalty = (anomalies * 18);
    const realUserPercentage = parseFloat(Math.max(2, basePercentage - penalty - (Math.random() * 3)).toFixed(2));
    
    const realViews = Math.round(views * (realUserPercentage / 100));
    const botViews = views - realViews;
    const efficiency = Math.max(0, 100 - (anomalies * 20) - (Math.random() * 2)).toFixed(2);
    
    let fidelity = 'HIGH';
    if (anomalies > 0.8) fidelity = 'MEDIUM';
    if (anomalies > 2) fidelity = 'LOW';

    // --- REVENUE DAMPENING & POOL MANAGEMENT ---
    const qualitySignal = parseFloat(efficiency) / 100;
    
    let calculatedRevenue = Math.sqrt(realViews) * qualitySignal * (config.baseMultiplier || 45); 
    
    const FLOOR_PAYOUT = config.minPayoutFloor || 15.00;
    if (realViews > 0 && calculatedRevenue < FLOOR_PAYOUT) {
        calculatedRevenue = FLOOR_PAYOUT;
        reasons.push('FLOOR_FAIRNESS: MINIMUM_PAYOUT_GUARANTEE');
    }

    const rawTheoreticalRevenue = views * 1.2;
    const fraudSavings = Math.max(0, rawTheoreticalRevenue - calculatedRevenue);

    return {
        anomalies: Math.ceil(anomalies),
        efficiency,
        fidelity,
        latency: (0.2 + Math.random() * 0.3).toFixed(2),
        realUserPercentage,
        realViews,
        botViews,
        revenue: calculatedRevenue.toFixed(2),
        fraudSavings: fraudSavings.toFixed(2),
        status: 'completed',
        analysisReasons: reasons,
        videoType: isShortForm ? 'SHORT_FORM' : 'LONG_FORM'
    };
};

// Fetch YouTube video details
router.get('/fetch-video', authenticate, async (req, res) => {
    const { videoUrl } = req.query;
    if (!videoUrl) return res.status(400).json({ message: 'URL required' });

    try {
        const getYouTubeID = (url) => {
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : null;
        };
        
        const videoId = getYouTubeID(videoUrl);
        
        if (!videoId) {
            return res.status(400).json({ message: 'Invalid YouTube URL' });
        }
        const response = await youtube.videos.list({
            part: 'snippet,statistics,contentDetails',
            id: videoId
        });

        if (!response.data.items.length) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const video = response.data.items[0];
        const channelId = video.snippet.channelId;
        const views = parseInt(video.statistics.viewCount) || 0;
        const durationInSeconds = Math.round(getDurationInMinutes(video.contentDetails.duration) * 60);

        // Fetch Channel Stats for Followers (Subscribers)
        const channelResponse = await youtube.channels.list({
            part: 'statistics',
            id: channelId
        });
        const followers = parseInt(channelResponse.data.items[0]?.statistics.subscriberCount) || 0;
        
        const config = await getSystemConfig();
        const realUserPercentage = 98.5;
        const realViews = Math.round(views * (realUserPercentage / 100));
        const qualitySignal = realUserPercentage / 100;
        
        const previewRevenue = (Math.sqrt(realViews) * qualitySignal * (config.baseMultiplier || 45)).toFixed(2);

        const data = {
            videoName: video.snippet.title,
            videoLength: formatDuration(video.contentDetails.duration),
            likes: video.statistics.likeCount,
            comments: video.statistics.commentCount,
            views: views,
            followers: followers,
            realUserPercentage,
            realViews,
            botViews: views - realViews,
            revenue: previewRevenue
        };

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('YouTube API Error:', err);
        res.status(500).json({ message: 'Failed to fetch video details' });
    }
});

// Create a new evaluation
router.post('/', authenticate, async (req, res) => {
    try {
        const { videoName, url } = req.body;
        if (!videoName || !url) {
            console.error('Validation Error: Missing videoName or url', req.body);
            return res.status(400).json({ success: false, message: 'Missing required fields: videoName and url' });
        }

        const config = await getSystemConfig();
        const analysis = analyzeVideoStats(req.body, config);

        const evaluation = new Evaluation({
            ...req.body,
            ...analysis,
            userId: req.user.id
        });
        await evaluation.save();

        config.remainingBudget -= parseFloat(analysis.revenue);
        await config.save();

        res.status(201).json({ success: true, evaluation });
    } catch (err) {
        console.error('Error saving evaluation:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET Global Config
router.get('/config', authenticate, async (req, res) => {
    try {
        const config = await getSystemConfig();
        res.status(200).json({ success: true, config });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// UPDATE Global Config
router.patch('/config', authenticate, async (req, res) => {
    try {
        const config = await getSystemConfig();
        Object.assign(config, req.body);
        config.lastUpdated = Date.now();
        await config.save();
        res.status(200).json({ success: true, config });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Get aggregated stats for dashboard
router.get('/stats', authenticate, async (req, res) => {
    try {
        const stats = await Evaluation.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(String(req.user.id)) } },
            { 
                $group: {
                    _id: null,
                    totalPayrolls: { $sum: 1 },
                    totalAnomalies: { $sum: "$anomalies" },
                    avgEfficiency: { $avg: "$efficiency" },
                    avgLatency: { $avg: "$latency" },
                    totalRevenue: { $sum: "$revenue" },
                    totalFraudSavings: { $sum: "$fraudSavings" },
                    totalRealViews: { $sum: "$realViews" },
                    totalBotViews: { $sum: "$botViews" }
                }
            }
        ]);

        const config = await getSystemConfig();
        const defaultStats = {
            totalPayrolls: 0, totalAnomalies: 0, avgEfficiency: 0, avgLatency: 0,
            totalRevenue: 0, totalFraudSavings: 0, totalRealViews: 0, totalBotViews: 0
        };

        res.status(200).json({ 
            success: true, 
            stats: stats[0] || defaultStats,
            config: {
                totalBudget: config.totalBudget,
                remainingBudget: config.remainingBudget,
                poolName: config.poolName
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get user's evaluations history
router.get('/history', authenticate, async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, evaluations });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
