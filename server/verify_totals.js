const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const verifyTotals = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userId = '696ef98a9017d76a20ecc4c8';

        const result = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] } },
                    cogs: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$totalCost", 0] } },
                    opex: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] } },
                    profit: { $sum: "$profit" }
                }
            }
        ]);

        const stats = result[0];
        console.log("New Financials:");
        console.log(`Revenue: ₹${stats.revenue.toLocaleString()}`);
        console.log(`COGS:    ₹${stats.cogs.toLocaleString()}`);
        console.log(`OpEx:    ₹${stats.opex.toLocaleString()}`);
        console.log(`Profit:  ₹${stats.profit.toLocaleString()}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyTotals();
