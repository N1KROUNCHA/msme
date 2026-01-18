require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/msme_growth';

// --- REALISTIC INDIAN FMCG DATA ---
const indianCatalog = [
    {
        category: 'Grains & Flour', items: [
            { name: 'Aashirvaad Whole Wheat Atta 10kg', price: 460, cost: 410 },
            { name: 'Daawat Rozana Gold Basmati Rice 5kg', price: 495, cost: 440 },
            { name: 'Fortune Chakki Fresh Atta 5kg', price: 235, cost: 210 },
            { name: 'India Gate Basmati Rice Feast Rozana 5kg', price: 425, cost: 380 },
            { name: 'Tata Sampann Unpolished Toor Dal 1kg', price: 185, cost: 165 },
            { name: 'Fortune Soya Chunks 200g', price: 50, cost: 42 },
            { name: 'Catch Turmeric Powder 200g', price: 65, cost: 55 },
            { name: 'Everest Tikhalal Chili Powder 100g', price: 85, cost: 72 }
        ]
    },
    {
        category: 'Edible Oils & Ghee', items: [
            { name: 'Fortune Soyabean Oil 1L Jar', price: 145, cost: 132 },
            { name: 'Saffola Gold Pro Healthy Oil 1L', price: 195, cost: 175 },
            { name: 'Dhara Kachi Ghani Mustard Oil 1L', price: 165, cost: 148 },
            { name: 'Amul Pure Ghee 1L Tin', price: 650, cost: 590 },
            { name: 'Gowardhan Pure Cow Ghee 500ml', price: 340, cost: 310 }
        ]
    },
    {
        category: 'Dairy & Bakery', items: [
            { name: 'Amul Taaza Fresh Milk 500ml', price: 27, cost: 24 },
            { name: 'Mother Dairy Full Cream Milk 500ml', price: 33, cost: 30 },
            { name: 'Britannia Marie Gold Biscuits 250g', price: 40, cost: 34 },
            { name: 'Parle-G Biscuits 800g Value Pack', price: 80, cost: 70 },
            { name: 'Amul Butter 500g', price: 275, cost: 255 },
            { name: 'Nandini GoodLife Toned Milk 1L', price: 54, cost: 50 }
        ]
    },
    {
        category: 'Snacks & Instant Food', items: [
            { name: 'Maggi 2-Minute Masala Noodles 12-Pack', price: 168, cost: 145 },
            { name: 'Top Ramen Curry Noodles 10-Pack', price: 140, cost: 120 },
            { name: 'Chings Secret Veg Hakka Noodles 150g', price: 45, cost: 38 },
            { name: 'Haldirams Alu Bhujia 400g', price: 105, cost: 90 },
            { name: 'Sunfeast Dark Fantasy Choco Fills 300g', price: 150, cost: 130 },
            { name: 'Lay\'s Classic Salted Party Pack', price: 50, cost: 42 },
            { name: 'Kurkure Masala Munch 90g', price: 20, cost: 17 }
        ]
    },
    {
        category: 'Beverages', items: [
            { name: 'Tata Tea Gold 500g', price: 320, cost: 285 },
            { name: 'Red Label Tea 1kg', price: 580, cost: 520 },
            { name: 'Nescafe Classic Instant Coffee 100g Jar', price: 345, cost: 310 },
            { name: 'Bru Instant Coffee Refill 200g', price: 420, cost: 375 },
            { name: 'Horlicks Health Drink 500g Refill', price: 265, cost: 240 },
            { name: 'Bournvita Chocolate Health Drink 500g', price: 245, cost: 220 }
        ]
    },
    {
        category: 'Household Care', items: [
            { name: 'Surf Excel Matic Front Load Powder 2kg', price: 480, cost: 420 },
            { name: 'Ariel Complete Detergent Powder 1kg', price: 215, cost: 190 },
            { name: 'Vim Dishwash Liquid 500ml Jar', price: 115, cost: 100 },
            { name: 'Dettol Liquid Handwash Refill 750ml', price: 110, cost: 95 },
            { name: 'Harpic Power Plus Toilet Cleaner 1L', price: 195, cost: 170 },
            { name: 'Lizol Disinfectant Floor Cleaner 2L', price: 395, cost: 345 }
        ]
    },
    {
        category: 'Spices & Staples', items: [
            { name: 'Everest Meat Masala 50g', price: 55, cost: 48 },
            { name: 'Catch Coriander Powder 200g', price: 75, cost: 65 },
            { name: 'MTR Sambar Powder 200g', price: 115, cost: 100 },
            { name: 'Tata Salt 1kg Lite', price: 45, cost: 38 },
            { name: 'Rajdhani Besan 500g', price: 65, cost: 58 }
        ]
    }
];

const personas = [
    {
        name: 'Ramesh Kirana Store',
        email: 'ramesh@msme.com',
        businessName: 'Ramesh Kirana Store',
        type: 'Grocery/Retail',
        metrics: { opEx: 12000, margin: 0.12 }
    },
    {
        name: 'StyleHub Boutique',
        email: 'style@msme.com',
        businessName: 'StyleHub Boutique',
        type: 'Apparel/Lifestyle',
        metrics: { opEx: 18000, margin: 0.35 }
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB. Clearing data.');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Transaction.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        for (const p of personas) {
            console.log(`Seeding: ${p.name}`);
            const user = await User.create({
                name: p.name,
                email: p.email,
                password: hashedPassword,
                businessName: p.businessName,
                businessType: p.type
            });

            // Generate Catalog for this user
            const userProducts = [];
            for (const cat of indianCatalog) {
                for (const item of cat.items) {
                    // Adjust prices slightly based on persona margin if needed
                    // But here we use fixed realistic prices
                    userProducts.push(await Product.create({
                        userId: user._id,
                        name: item.name,
                        category: cat.category,
                        price: item.price,
                        costPrice: item.cost,
                        stock: Math.floor(Math.random() * 50) + 10,
                        reorderLevel: 15
                    }));
                }
            }

            // Generate Transactions for 1 Year
            const txs = [];
            const dayCount = 365;
            const startDate = new Date('2025-01-01');

            for (let i = 0; i < dayCount; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);

                // DAILY SALES
                // Ramesh has many small tickets, StyleHub has fewer large tickets
                const salesVolume = p.name === 'Ramesh Kirana Store' ? 5 : 2;

                for (let j = 0; j < salesVolume; j++) {
                    const selectedItems = [];
                    const itemCount = Math.floor(Math.random() * 3) + 1;
                    let totalAmount = 0;
                    let totalCost = 0;

                    for (let k = 0; k < itemCount; k++) {
                        const randomProd = userProducts[Math.floor(Math.random() * userProducts.length)];
                        const qty = Math.floor(Math.random() * 3) + 1;
                        selectedItems.push({
                            productId: randomProd._id,
                            name: randomProd.name,
                            quantity: qty,
                            price: randomProd.price,
                            costPrice: randomProd.costPrice
                        });
                        totalAmount += (randomProd.price * qty);
                        totalCost += (randomProd.costPrice * qty);
                    }

                    txs.push({
                        userId: user._id,
                        date: new Date(currentDate),
                        desc: `Sale: ${selectedItems.map(si => si.name.split(' ')[0]).join(', ')}`,
                        type: 'Income',
                        amount: totalAmount,
                        totalCost: totalCost,
                        profit: totalAmount - totalCost,
                        category: 'Sales',
                        status: 'completed',
                        products: selectedItems
                    });
                }

                // MONTHLY EXPENSES (OpEx)
                if (currentDate.getDate() === 1) {
                    const rent = Math.floor(p.metrics.opEx * 0.4);
                    const salary = Math.floor(p.metrics.opEx * 0.4);
                    const utils = Math.floor(p.metrics.opEx * 0.2);

                    const expenses = [
                        { desc: 'Monthly Shop Rent', amount: rent, cat: 'Rent' },
                        { desc: 'Staff Salary (2 staff)', amount: salary, cat: 'Salary' },
                        { desc: 'Electricity & Water', amount: utils, cat: 'Utilities' }
                    ];

                    expenses.forEach(exp => {
                        txs.push({
                            userId: user._id,
                            date: new Date(currentDate),
                            desc: exp.desc,
                            type: 'Expense',
                            amount: exp.amount,
                            profit: -exp.amount, // Expense is negative profit
                            category: exp.cat,
                            status: 'completed'
                        });
                    });
                }
            }

            await Transaction.insertMany(txs);
            console.log(`  -> Generated ${txs.length} transactions for ${user.businessName}`);
        }

        console.log('DONE! Highly Realistic Indian Dataset generated.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
