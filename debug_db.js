require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Transaction = require('./server/models/Transaction');

const MONGO_URI = process.env.MONGO_URI;

async function debug() {
    try {
        console.log('Connecting to (Abridged):', MONGO_URI ? MONGO_URI.substring(0, 20) + '...' : 'undefined');
        if (!MONGO_URI) throw new Error("MONGO_URI is undefined!");

        await mongoose.connect(MONGO_URI);

        const count = await Transaction.countDocuments();
        console.log('Count:', count);

        const income = await Transaction.findOne({ type: 'Income' });
        console.log('--- INCOME SAMPLE ---');
        console.log(JSON.stringify(income, null, 2));

        const expense = await Transaction.findOne({ type: 'Expense' });
        console.log('--- EXPENSE SAMPLE ---');
        console.log(JSON.stringify(expense, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
