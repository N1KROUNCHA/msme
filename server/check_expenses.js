const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const checkExpenses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const transactions = await Transaction.find({ type: 'Expense' });

        console.log(`Found ${transactions.length} Expenses.`);
        transactions.forEach(t => {
            console.log(`${t.date.toISOString()} | ${t.amount} | Cat: ${t.category} | Desc: ${t.desc}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkExpenses();
