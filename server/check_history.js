const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected via URI');

        const products = await Product.find({}).limit(5);

        console.log(`Found ${products.length} products.`);

        products.forEach(p => {
            console.log(`\nProduct: ${p.name}`);
            console.log(`Stock: ${p.stock}`);
            console.log(`History (Last 10 days): ${JSON.stringify(p.history.slice(-10))}`);
            console.log(`History Length: ${p.history.length}`);

            // Calculate avg
            if (p.history.length > 0) {
                const avg = p.history.reduce((a, b) => a + b, 0) / p.history.length;
                console.log(`Calculated Avg Sales: ${avg.toFixed(2)}`);
            }
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkHistory();
