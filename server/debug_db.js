require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const MONGO_URI = process.env.MONGO_URI;

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        const income = await Transaction.findOne({ type: 'Income' }).lean();
        console.log('--- INCOME KEYS ---');
        console.log(Object.keys(income));
        console.log('totalCost:', income.totalCost);
        console.log('amount:', income.amount);
        console.log('profit:', income.profit);

        const expense = await Transaction.findOne({ type: 'Expense' }).lean();
        console.log('--- EXPENSE KEYS ---');
        console.log(Object.keys(expense));
        console.log('amount:', expense.amount);
        console.log('profit:', expense.profit);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
