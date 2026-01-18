require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Transaction = require('./server/models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        console.log('--- USERS ---');
        for (const u of users) {
            const txs = await Transaction.find({ userId: u._id });
            const revenue = txs.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);
            const cogs = txs.filter(t => t.type === 'Income').reduce((s, t) => s + (t.totalCost || 0), 0);
            console.log(`User: ${u.email}, ID: ${u._id}, Name: ${u.name}, Txs: ${txs.length}, Revenue: ${revenue}, COGS: ${cogs}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
