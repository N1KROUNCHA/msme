require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        console.log('--- ALL USERS ---');
        users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}`));

        const orphans = await Transaction.countDocuments({ userId: { $exists: false } });
        console.log('Orphan Transactions (No userId):', orphans);

        const nulls = await Transaction.countDocuments({ userId: null });
        console.log('Null userId Transactions:', nulls);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
