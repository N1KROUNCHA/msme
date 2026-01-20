const mongoose = require('mongoose');
const NetworkNode = require('./models/NetworkNode');
require('dotenv').config();

const seedNetwork = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Clear existing nodes
        await NetworkNode.deleteMany({});
        console.log("Cleared old network nodes.");

        // Helper to generate history
        const genHistory = (base) => {
            return Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
                sales: Math.floor(base + Math.random() * 20)
            }));
        };

        const nodes = [
            {
                name: "Metro Supermarket",
                type: "Medium Enterprise",
                inventory: [
                    { name: 'Rice (25kg Bag)', stock: 500 },
                    { name: 'Sunflower Oil (1L)', stock: 200 },
                    { name: 'Sugar (kg)', stock: 300 }
                ],
                salesHistory: genHistory(100)
            },
            {
                name: "City Generic Store",
                type: "Medium Enterprise",
                inventory: [
                    { name: 'Soaps', stock: 1000 },
                    { name: 'Toothpaste', stock: 500 },
                    { name: 'Detergent', stock: 400 }
                ],
                salesHistory: genHistory(80)
            },
            {
                name: "Raju Kirana",
                type: "Small Enterprise",
                inventory: [
                    { name: 'Rice (25kg Bag)', stock: 20 },
                    { name: 'Sugar (kg)', stock: 15 },
                    { name: 'Toor Dal (kg)', stock: 10 }
                ],
                salesHistory: genHistory(15)
            },
            {
                name: "Annapurna Provisions",
                type: "Small Enterprise",
                inventory: [
                    { name: 'Atta (10kg)', stock: 25 },
                    { name: 'Maida (kg)', stock: 30 },
                    { name: 'Rava (kg)', stock: 20 }
                ],
                salesHistory: genHistory(20)
            },
            {
                name: "Laxmi General Store",
                type: "Small Enterprise",
                inventory: [
                    { name: 'Biscuits', stock: 100 },
                    { name: 'Chocolates', stock: 150 },
                    { name: 'Chips', stock: 80 }
                ],
                salesHistory: genHistory(25)
            }
        ];

        await NetworkNode.insertMany(nodes);
        console.log("Seeded 5 Real Network Nodes with Sales History.");

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedNetwork();
