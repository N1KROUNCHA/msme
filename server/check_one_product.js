const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkOne = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Find a popular product that SHOULD have high sales
        const p = await Product.findOne({ name: { $regex: 'Atta', $options: 'i' } });

        if (!p) {
            console.log('Product not found!');
        } else {
            console.log(`Product: ${p.name}`);
            console.log(`Stock: ${p.stock}`);
            console.log(`History Length: ${p.history.length}`);
            console.log(`History (Last 90 days): ${JSON.stringify(p.history)}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOne();
