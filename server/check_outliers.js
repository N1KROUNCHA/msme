const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const checkOutliers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userId = '696ef98a9017d76a20ecc4c8';

        // Get Stats
        const stats = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'Income' } },
            {
                $group: {
                    _id: null,
                    avgAmount: { $avg: "$amount" },
                    maxAmount: { $max: "$amount" },
                    minAmount: { $min: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("Stats:", stats[0]);

        // Show top 5 biggest transactions
        const top5 = await Transaction.find({ userId, type: 'Income' })
            .sort({ amount: -1 })
            .limit(5)
            .select('amount items date');

        console.log("\nTop 5 Transactions:");
        top5.forEach(t => console.log(`- ₹${t.amount} (${t.items.length} items) on ${t.date}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOutliers();
