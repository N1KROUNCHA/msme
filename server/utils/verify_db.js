require('dotenv').config();
const mongoose = require('mongoose');

// Models (Use generic definitions to avoid model/schema issues impacting verification)
const User = mongoose.model('User', new mongoose.Schema({}), 'users');
const Product = mongoose.model('Product', new mongoose.Schema({}), 'products');
// Check both potential transaction collection names
const TransactionRaw = mongoose.model('TransactionRaw', new mongoose.Schema({}), 'transactions');
const TransactionCleanRaw = mongoose.model('TransactionCleanRaw', new mongoose.Schema({}), 'transactioncleans');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('--- Database Verification ---');

        const userCount = await User.countDocuments();
        console.log(`Users: ${userCount}`);

        const prodCount = await Product.countDocuments();
        console.log(`Products: ${prodCount}`);

        const txnCount = await TransactionRaw.countDocuments();
        console.log(`Transactions (collection 'transactions'): ${txnCount}`);

        const txnCleanCount = await TransactionCleanRaw.countDocuments();
        console.log(`Transactions (collection 'transactioncleans'): ${txnCleanCount}`);

        if (txnCleanCount > 0 && txnCount === 0) {
            console.log('Fixing Collection Name...');
            await mongoose.connection.db.collection('transactioncleans').rename('transactions');
            console.log('Renamed transactioncleans -> transactions');
        }

        console.log('-----------------------------');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
