require('dotenv').config();
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({}), 'users');
const Product = mongoose.model('Product', new mongoose.Schema({}), 'products');
const Transaction = mongoose.model('Transaction', new mongoose.Schema({}), 'transactions');
const MsmeTransaction = mongoose.model('MsmeTransaction', new mongoose.Schema({}), 'transactions'); // Double check collection binding

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const u = await User.countDocuments();
        const p = await Product.countDocuments();
        const t = await Transaction.countDocuments();

        console.log(`USERS: ${u}`);
        console.log(`PRODUCTS: ${p}`);
        console.log(`TRANSACTIONS: ${t}`);
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
