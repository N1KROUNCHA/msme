const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const reduceData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const userId = '696ef98a9017d76a20ecc4c8';

        // targeted revenue: 80,00,000
        // current revenue: 8,58,08,794
        // retention rate = 80L / 858L ~= 0.093 (~9.3%)
        const retentionRate = 0.093;

        console.log(`Target Retention Rate: ${retentionRate * 100}%`);

        const allTx = await Transaction.find({ userId }).select('_id');
        console.log(`Total Transactions: ${allTx.length}`);

        const toDelete = [];
        allTx.forEach(t => {
            if (Math.random() > retentionRate) {
                toDelete.push(t._id);
            }
        });

        console.log(`Deleting ${toDelete.length} transactions...`);

        if (toDelete.length > 0) {
            const res = await Transaction.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${res.deletedCount} documents.`);
        }

        console.log("✅ Data reduction complete.");
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reduceData();
