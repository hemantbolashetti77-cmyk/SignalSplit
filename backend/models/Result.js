const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dataStreamId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataStream' },
    summary: { type: String },
    metrics: { type: Object },
    cleansedDataUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
