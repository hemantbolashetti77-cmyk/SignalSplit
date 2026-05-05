const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const mongoose = require('mongoose');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

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
        const views = parseInt(video.statistics.viewCount) || 0;
        const durationInSeconds = Math.round(getDurationInMinutes(video.contentDetails.duration) * 60);
        
        // Initial estimate for preview
        const data = {
            videoName: video.snippet.title,
            videoLength: formatDuration(video.contentDetails.duration),
            likes: video.statistics.likeCount,
            comments: video.statistics.commentCount,
            views: views,
            runtime: formatDuration(video.contentDetails.duration),
            runtimeSeconds: durationInSeconds,
            realUserPercentage: 98.5, // Default estimate
            realViews: Math.round(views * 0.985),
            botViews: Math.round(views * 0.015),
            revenue: (Math.round(views * 0.985) * 1).toFixed(2)
        };

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('YouTube API Error:', err);
        res.status(500).json({ message: 'Failed to fetch video details' });
    }
});

// Helper to analyze video stats for anomalies
const analyzeVideoStats = (stats) => {
    const views = parseInt(stats.views) || 0;
    const likes = parseInt(stats.likes) || 0;
    const comments = parseInt(stats.comments) || 0;
    const durationInSeconds = getDurationInMinutes(stats.runtime) * 60;
    const isShortForm = durationInSeconds <= 60 && durationInSeconds > 0;
    
    let anomalies = 0;
    let reasons = [];

    // 1. Core Engagement Anomalies
    if (views > 100 && likes > views) {
        anomalies += 2;
        reasons.push('IMPOSSIBLE_ENGAGEMENT: LIKES > VIEWS');
    }

    // 2. Retention Rules (User Request: Short=Full, Long=30s)
    if (isShortForm) {
        // Shorts require full viewing. Low engagement on shorts is a major bot signal.
        const interactionRate = (likes + comments) / views;
        if (interactionRate < 0.01 && views > 500) {
            anomalies += 1.5;
            reasons.push('SHORT_FORM_RETENTION_FAILURE: FULL_VIEW_REQUIREMENT_NOT_MET');
        }
    } else {
        // Long form requires at least 30s. 
        // If views are high but engagement is "Ghostly", it implies <30s abandonment.
        if (views > 1000 && (likes + comments) < (views * 0.005)) {
            anomalies += 1.2;
            reasons.push('LONG_FORM_ABANDONMENT: <30S_ESTIMATED_RETENTION');
        }
    }

    if (views > 100000 && (likes + comments) < 10) {
        anomalies += 2;
        reasons.push('HIGH_VIEW_LOW_INTERACTION: GHOST_TRAFFIC');
    }

    // Calculate real user percentage based on anomalies and form-factor rules
    let basePercentage = isShortForm ? 94 : 98; // Shorts naturally attract more bot-like behavior
    const penalty = (anomalies * 18);
    const realUserPercentage = parseFloat(Math.max(2, basePercentage - penalty - (Math.random() * 3)).toFixed(2));
    
    const realViews = Math.round(views * (realUserPercentage / 100));
    const botViews = views - realViews;

    // Calculate efficiency score
    const efficiency = Math.max(0, 100 - (anomalies * 20) - (Math.random() * 2)).toFixed(2);
    
    // Determine fidelity
    let fidelity = 'HIGH';
    if (anomalies > 0.8) fidelity = 'MEDIUM';
    if (anomalies > 2) fidelity = 'LOW';

    return {
        anomalies: Math.ceil(anomalies),
        efficiency,
        fidelity,
        latency: (0.2 + Math.random() * 0.3).toFixed(2),
        realUserPercentage,
        realViews,
        botViews,
        revenue: (realViews * 1.2).toFixed(2), // Increased rate for verified "Real" views
        status: 'completed',
        analysisReasons: reasons,
        videoType: isShortForm ? 'SHORT_FORM' : 'LONG_FORM',
        runtimeSeconds: durationInSeconds
    };
};

// Create a new evaluation
router.post('/', authenticate, async (req, res) => {
    try {
        const analysis = analyzeVideoStats(req.body);

        const evaluation = new Evaluation({
            ...req.body,
            ...analysis,
            userId: req.user.id
        });
        await evaluation.save();
        res.status(201).json({ success: true, evaluation });
    } catch (err) {
        console.error('Error saving evaluation:', err);
        res.status(500).json({ success: false, message: 'Server error' });
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
                    totalRealViews: { $sum: "$realViews" },
                    totalBotViews: { $sum: "$botViews" }
                }
            }
        ]);

        const defaultStats = {
            totalPayrolls: 0,
            totalAnomalies: 0,
            avgEfficiency: 0,
            avgLatency: 0,
            totalRevenue: 0,
            totalRealViews: 0,
            totalBotViews: 0
        };

        res.status(200).json({ success: true, stats: stats[0] || defaultStats });
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
        console.error('Error fetching history:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
