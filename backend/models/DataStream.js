const mongoose = require('mongoose');

const dataStreamSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    source: { type: String }, // e.g., 'API', 'Upload', 'Webhook'
    status: { type: String, enum: ['active', 'paused', 'error'], default: 'active' },
    config: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DataStream', dataStreamSchema);
