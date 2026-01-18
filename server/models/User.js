const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessName: { type: String },
    businessType: { type: String }, // e.g., 'Retail', 'Manufacturing'
    sector: { type: String },       // e.g., 'Food & Beverage', 'Textiles'
    location: { type: String },
    size: { type: String },         // 'Micro', 'Small', 'Medium'
    annualTurnover: { type: Number },
    growthGoals: [{ type: String }], // Array of strings like ['Increase sales', 'Reduce waste']
    onboardingComplete: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
