const mongoose = require('mongoose');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const verifySync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userId = '696ef98a9017d76a20ecc4c8';

        // 1. Pick a product
        const product = await Product.findOne({ userId });
        if (!product) { console.log("No product found"); process.exit(0); }

        console.log(`Product: ${product.name}`);
        console.log(`Initial Stock: ${product.stock}`);
        const initialHistoryLast = product.history[product.history.length - 1];
        console.log(`Initial Demand History (Today): ${initialHistoryLast}`);

        // 2. Simulate Sale Logic (replicating route code)
        const qty = 5;
        product.stock -= qty;
        product.history[product.history.length - 1] += qty;
        product.markModified('history');
        await product.save();

        console.log(`\n--- SOLD ${qty} UNITS ---\n`);

        // 3. Verify
        const updatedProduct = await Product.findById(product._id);
        console.log(`New Stock: ${updatedProduct.stock} (Expected: ${product.stock})`);
        const newHistoryLast = updatedProduct.history[updatedProduct.history.length - 1];
        console.log(`New Demand History: ${newHistoryLast} (Expected: ${initialHistoryLast + qty})`);

        if (newHistoryLast === initialHistoryLast + qty) {
            console.log("\n✅ SUCCESS: Demand Forecast is SYNCHRONIZED with Sales!");
        } else {
            console.log("\n❌ FAIL: History did not update correctly.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifySync();
