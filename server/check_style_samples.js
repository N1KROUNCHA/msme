require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const styleId = '696a6e4490a1f2d73e06c56e';
        const income = await Transaction.find({ userId: styleId, type: 'Income' }).limit(5);
        console.log(`--- STYLE HUB INCOME SAMPLES ---`);
        income.forEach(t => {
            console.log(`Amt: ${t.amount}, Cost: ${t.totalCost}, Prof: ${t.profit}`);
        });

        const expense = await Transaction.find({ userId: styleId, type: 'Expense' }).limit(5);
        console.log(`--- STYLE HUB EXPENSE SAMPLES ---`);
        expense.forEach(t => {
            console.log(`Amt: ${t.amount}, Prof: ${t.profit}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
