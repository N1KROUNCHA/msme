const mongoose = require('mongoose');
const NetworkNode = require('./models/NetworkNode');
require('dotenv').config();

const checkNetwork = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const nodes = await NetworkNode.find();
        console.log(`Found ${nodes.length} Network Nodes.`);

        nodes.forEach(n => {
            console.log(`- ${n.name} (${n.type})`);
            console.log(`  Inventory: ${n.inventory.map(i => `${i.name}: ${i.stock}`).join(', ')}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkNetwork();
