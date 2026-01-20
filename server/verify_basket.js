const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const verifyBasket = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userId = '696ef98a9017d76a20ecc4c8';

        const sample = await Transaction.findOne({ userId, type: 'Income' });
        console.log("Sample Items:", JSON.stringify(sample.items, null, 2));

        const count = await Transaction.countDocuments({ userId });
        console.log("Total Transactions:", count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyBasket();
