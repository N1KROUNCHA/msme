const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
    costPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    lastRestocked: { type: Date },
    history: { type: [Number], default: [] } // Store last 60 days sales history
});

module.exports = mongoose.model('Product', ProductSchema);
