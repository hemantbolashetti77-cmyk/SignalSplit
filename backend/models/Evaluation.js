const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoName: { type: String, required: true },
    url: { type: String, required: true },
    videoLength: { type: String },
    likes: { type: Number },
    comments: { type: Number },
    views: { type: Number },
    followers: { type: Number, default: 0 },
    videoType: { type: String },
    anomalies: { type: Number, default: 0 },
    efficiency: { type: Number, default: 99.9 },
    latency: { type: Number, default: 0.4 },
    fidelity: { type: String, default: 'HIGH' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    revenue: { type: Number },
    fraudSavings: { type: Number, default: 0 },
    realViews: { type: Number, default: 0 },
    botViews: { type: Number, default: 0 },
    realUserPercentage: { type: Number, default: 100 },
    analysisReasons: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
