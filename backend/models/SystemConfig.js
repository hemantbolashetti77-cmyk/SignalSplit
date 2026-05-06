const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    poolName: { type: String, default: 'Alpha Hackathon Pool' },
    totalBudget: { type: Number, default: 1000000 }, // ₹1,000,000 pool
    remainingBudget: { type: Number, default: 1000000 },
    baseMultiplier: { type: Number, default: 45 },
    sqrtWeight: { type: Number, default: 1.0 },
    minPayoutFloor: { type: Number, default: 15.00 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
