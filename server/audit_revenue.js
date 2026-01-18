require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const report = await Transaction.aggregate([
            { $match: { type: 'Income' } },
            {
                $group: {
                    _id: '$userId',
                    totalRevenue: { $sum: '$amount' },
                    totalCOGS: { $sum: '$totalCost' },
                    totalProfit: { $sum: '$profit' },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('--- REVENUE AUDIT ---');
        report.forEach(r => {
            console.log(`UserID: ${r._id}, Revenue: ${r.totalRevenue}, COGS: ${r.totalCOGS}, Profit: ${r.totalProfit}, Count: ${r.count}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
