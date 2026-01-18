require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI;

async function debug() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);

        const count = await Transaction.countDocuments();
        console.log('Count:', count);

        const income = await Transaction.findOne({ type: 'Income' });
        console.log('Income Sample:', income);

        const expense = await Transaction.findOne({ type: 'Expense' });
        console.log('Expense Sample:', expense);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
