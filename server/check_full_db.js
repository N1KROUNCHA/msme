const mongoose = require('mongoose');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const checkFull = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const total = await Product.countDocuments();
        console.log(`Total Products: ${total}`);

        const withHistory = await Product.countDocuments({ history: { $not: { $size: 0 } } });
        console.log(`Products with History > 0: ${withHistory}`);

        const topProd = await Product.findOne({ history: { $not: { $size: 0 } } });
        if (topProd) {
            console.log(`Example: ${topProd.name}`);
            console.log(`History Len: ${topProd.history.length}`);
            console.log(`First 10: ${topProd.history.slice(0, 10)}`);
        }

        const txCount = await Transaction.countDocuments();
        console.log(`Total Transactions: ${txCount}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkFull();
