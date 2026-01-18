require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        for (const u of users) {
            const txs = await Transaction.find({ userId: u._id });
            const income = txs.filter(t => t.type === 'Income');
            const expense = txs.filter(t => t.type === 'Expense');
            const revenue = income.reduce((s, t) => s + (t.amount || 0), 0);
            const profit = txs.reduce((s, t) => s + (t.profit || 0), 0);
            console.log(`[USER] Email: ${u.email}, ID: ${u._id}, Rev: ${revenue}, Profit: ${profit}, Txs: ${txs.length}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
