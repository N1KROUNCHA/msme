const mongoose = require('mongoose');

const NetworkNodeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // 'Supermarket', 'Kirana', 'Medium Enterprise', 'Small Enterprise'
    location: {
        lat: Number,
        lng: Number
    },
    inventory: [{
        name: String,
        stock: Number
    }],
    salesHistory: [{ date: Date, sales: Number }], // Added for Demand Forecasting
    lastActivity: { type: String, default: 'Idle' },
    connectionStrength: { type: Number, default: 85 } // % trust score
}, { timestamps: true });

module.exports = mongoose.model('NetworkNode', NetworkNodeSchema);
