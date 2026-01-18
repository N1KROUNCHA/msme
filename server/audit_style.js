require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'style@msme.com' });
        if (!user) {
            console.log('User style@msme.com not found');
            process.exit(0);
        }

        const txs = await Transaction.find({ userId: user._id });
        const income = txs.filter(t => t.type === 'Income');
        const expense = txs.filter(t => t.type === 'Expense');

        const revenue = income.reduce((s, t) => s + (t.amount || 0), 0);
        const cogs = income.reduce((s, t) => s + (t.totalCost || 0), 0);
        const gprofit = income.reduce((s, t) => s + (t.profit || 0), 0);
        const opex = expense.reduce((s, t) => s + (t.amount || 0), 0);
        const eprofit = expense.reduce((s, t) => s + (t.profit || 0), 0); // Should be -opex
        const netProfit = gprofit + eprofit;

        console.log(`--- STYLE HUB AUDIT (${user._id}) ---`);
        console.log(`Revenue: ${revenue}`);
        console.log(`COGS: ${cogs}`);
        console.log(`OpEx: ${opex}`);
        console.log(`Net Profit: ${netProfit}`);
        console.log(`Txs: ${txs.length} (${income.length} Income, ${expense.length} Expense)`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
