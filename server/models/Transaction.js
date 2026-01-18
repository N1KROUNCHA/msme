const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    desc: { type: String }, // Matches db.json 'desc'
    type: { type: String, required: true }, // Income vs Expense
    amount: { type: Number, required: true },
    category: { type: String },
    paymentMethod: { type: String },
    status: { type: String, default: 'completed' },
    profit: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    customerName: { type: String },
    customerPhone: { type: String },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number, // Selling Price
        costPrice: Number // Buying Price
    }]
});

module.exports = mongoose.model('Transaction', TransactionSchema);
