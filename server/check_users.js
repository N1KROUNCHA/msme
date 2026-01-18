require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        console.log('--- USERS ---');
        for (const u of users) {
            const txs = await Transaction.find({ userId: u._id });
            const incomeTx = txs.filter(t => t.type === 'Income');
            const revenue = incomeTx.reduce((s, t) => s + (t.amount || 0), 0);
            const cogs = incomeTx.reduce((s, t) => s + (t.totalCost || 0), 0);
            const expense = txs.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
            console.log(`Email: ${u.email}, ID: ${u._id}, Txs: ${txs.length}, Revenue: ${revenue}, COGS: ${cogs}, OpEx: ${expense}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
