const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Product = require('./models/Product');
require('dotenv').config();

const addIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Add indexes for faster queries
        await Transaction.collection.createIndex({ userId: 1, date: -1 });
        await Transaction.collection.createIndex({ userId: 1, type: 1 });
        await Product.collection.createIndex({ userId: 1, stock: 1 });

        console.log("✅ Indexes created successfully!");
        console.log("- Transaction: userId + date (descending)");
        console.log("- Transaction: userId + type");
        console.log("- Product: userId + stock");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

addIndexes();
