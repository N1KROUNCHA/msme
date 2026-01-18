require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const report = await Transaction.aggregate([
            { $match: { type: 'Income' } },
            {
                $group: {
                    _id: '$userId',
                    rev: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('--- REVENUE BY USERID ---');
        report.forEach(r => {
            console.log(`UserID: ${r._id}, Rev: ${r.rev}, Count: ${r.count}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
