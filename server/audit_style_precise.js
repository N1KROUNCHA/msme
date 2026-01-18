require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const styleId = '696a6e4490a1f2d73e06c56e';
        const txs = await Transaction.find({ userId: styleId });
        const income = txs.filter(t => t.type === 'Income');
        const expense = txs.filter(t => t.type === 'Expense');

        const rev = income.reduce((s, t) => s + (t.amount || 0), 0);
        const profit = txs.reduce((s, t) => s + (t.profit || 0), 0);
        const cogs = income.reduce((s, t) => s + (t.totalCost || 0), 0);
        const opex = expense.reduce((s, t) => s + (t.amount || 0), 0);

        console.log(`StyleHub: Rev=${rev}, Profit=${profit}, COGS=${cogs}, OpEx=${opex}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
