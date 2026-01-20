const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
require('dotenv').config();

const findUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const users = await User.find();
        console.log(`Scanning ${users.length} users...`);

        for (const user of users) {
            const result = await Transaction.aggregate([
                { $match: { userId: user._id, type: 'Income' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            const revenue = result[0]?.total || 0;
            if (revenue > 1000000) { // Only show > 10 Lakhs
                console.log(`\nUser: ${user.name} | ${user.businessName}`);
                console.log(`ID: ${user._id}`);
                console.log(`Revenue: ₹${revenue.toLocaleString()}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findUser();
