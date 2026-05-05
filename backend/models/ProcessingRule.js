const mongoose = require('mongoose');

const processingRuleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    logic: { type: String }, // Code or JSON representation of the rule
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProcessingRule', processingRuleSchema);
