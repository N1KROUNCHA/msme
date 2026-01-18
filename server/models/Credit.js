const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    totalUdhaar: { type: Number, default: 0 },
    transactions: [{
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'payment'], required: true }, // credit = took udhaar, payment = paid back
        desc: String
    }],
    riskScore: { type: Number, default: 0 }, // 0 to 1, calculated by AI
    recoveryProbability: { type: Number, default: 0.5 },
    lastAnalysisDate: { type: Date },
    status: { type: String, enum: ['Active', 'Delinquent', 'Settled'], default: 'Active' }
});

module.exports = mongoose.model('Credit', CreditSchema);
