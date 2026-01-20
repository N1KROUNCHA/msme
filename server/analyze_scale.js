const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
require('dotenv').config();

const analyzeRevenue = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Find the user (assuming the active one, or we search by email/name if known from context)
        // From previous context, user ID is likely 678e4b5c9d8f2a1b3c4d5e6f (Apna Supermarket)
        const userId = '678e4b5c9d8f2a1b3c4d5e6f';

        const pipeline = [
            { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'Income' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ];

        const result = await Transaction.aggregate(pipeline);
        const currentRevenue = result[0]?.total || 0;

        console.log(`Current Total Revenue: ₹${currentRevenue.toLocaleString()}`);
        console.log(`Target Revenue:      ₹80,00,000`);

        const factor = currentRevenue / 8000000;
        console.log(`Scaling Factor Needed: ${factor.toFixed(2)}`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

analyzeRevenue();
