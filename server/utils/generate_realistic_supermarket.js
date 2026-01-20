require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

// --- CONSTANTS ---
// Expanded brands list for variety
const BRANDS = {
    'Staples': ['Aashirvaad', 'India Gate', 'Fortune', 'Tata', 'Daawat', 'Nature Fresh', 'Patanjali', 'Organic Tattva', '24 Mantra', 'Kohinoor'],
    'Dairy': ['Amul', 'Nandini', 'Gowardhan', 'Mother Dairy', 'Britannia', 'Nestle', 'Milky Mist', 'Go', 'Prabhat'],
    'Snacks': ['Haldiram\'s', 'Lays', 'Kurkure', 'Bikaji', 'Parle', 'Brittania', 'Sunfeast', 'Maggi', 'Yippee', 'Chings', 'Bingo', 'Pringles', 'Doritos'],
    'Beverages': ['Tata Tea', 'Brooke Bond', 'Nescafe', 'Coca Cola', 'Pepsi', 'Frooti', 'Red Bull', 'Maaza', 'Slice', 'Thums Up', 'Sprite', 'Mirinda', 'Mountain Dew', 'Real', 'Tropicana'],
    'Personal Care': ['Dettol', 'Lifebuoy', 'Colgate', 'Dove', 'Pears', 'Himalaya', 'Nivea', 'Garnier', 'Pantene', 'Sunsilk', 'Head & Shoulders', 'Tresemme', 'Lux', 'Santoor', 'Fiama'],
    'Household': ['Surf Excel', 'Vim', 'Lizol', 'Harpic', 'Ariel', 'Rin', 'Comfort', 'Odonil', 'Domex', 'Pril', 'Exo', 'Henko', 'Tide', 'Mr. Muscle'],
    'Spices': ['Everest', 'MDH', 'Badshah', 'Catch', 'MTR', 'Eastern', 'Sakthi', 'Aachi', 'Priya', 'Smith & Jones'],
    'Biscuits': ['Parle-G', 'Britannia', 'Sunfeast', 'Oreo', 'Monaco', 'Hide & Seek', 'Good Day', 'Marie Gold', 'Nutrichoice', 'Tiger', 'Bourbon', 'Jim Jam'],
    'Chocolates': ['Cadbury Dairy Milk', 'KitKat', 'Munch', '5 Star', 'Perk', 'Ferrero Rocher', 'Snickers', 'Mars', 'Toblerone', 'Milkybar', 'Gems']
};

const PRODUCTS_TEMPLATE = [
    // Staples
    { name: 'Atta 10kg', category: 'Staples', price: 450, brands: ['Aashirvaad', 'Nature Fresh', 'Fortune', 'Pillsbury', 'Godrej'] },
    { name: 'Atta 5kg', category: 'Staples', price: 240, brands: ['Aashirvaad', 'Fortune', 'Patanjali'] },
    { name: 'Basmati Rice 5kg', category: 'Staples', price: 650, brands: ['India Gate', 'Daawat', 'Fortune', 'Kohinoor'] },
    { name: 'Basmati Rice 1kg', category: 'Staples', price: 140, brands: ['India Gate', 'Daawat', 'Fortune'] },
    { name: 'Sona Masoori Rice 10kg', category: 'Staples', price: 550, brands: ['India Gate', 'Udhaiyam'] },
    { name: 'Toor Dal 1kg', category: 'Staples', price: 160, brands: ['Tata', 'Fortune', 'Organic Tattva'] },
    { name: 'Moong Dal 1kg', category: 'Staples', price: 130, brands: ['Tata', 'Natureland'] },
    { name: 'Chana Dal 1kg', category: 'Staples', price: 90, brands: ['Tata', 'Fortune'] },
    { name: 'Urad Dal 1kg', category: 'Staples', price: 140, brands: ['Tata', 'Fortune'] },
    { name: 'Sugar 1kg', category: 'Staples', price: 45, brands: ['Madhur', 'Trust', 'Parry\'s'] },
    { name: 'Salt 1kg', category: 'Staples', price: 28, brands: ['Tata', 'Aashirvaad'] },
    { name: 'Sunflower Oil 1L', category: 'Staples', price: 140, brands: ['Fortune', 'Saffola', 'Sunpure', 'Freedom'] },
    { name: 'Mustard Oil 1L', category: 'Staples', price: 160, brands: ['Fortune', 'Dhara', 'Patanjali'] },
    { name: 'Groundnut Oil 1L', category: 'Staples', price: 180, brands: ['Fortune', 'Dhara'] },

    // Dairy
    { name: 'Butter 500g', category: 'Dairy', price: 275, brands: ['Amul', 'Mother Dairy', 'Nandini'] },
    { name: 'Butter 100g', category: 'Dairy', price: 56, brands: ['Amul', 'Mother Dairy'] },
    { name: 'Cheese Slices 200g', category: 'Dairy', price: 140, brands: ['Amul', 'Britannia', 'Gowardhan', 'Go'] },
    { name: 'Cheese Cube 200g', category: 'Dairy', price: 130, brands: ['Amul', 'Britannia'] },
    { name: 'Ghee 1L', category: 'Dairy', price: 650, brands: ['Amul', 'Gowardhan', 'Ananda', 'Patanjali', 'Aashirvaad'] },
    { name: 'Ghee 500ml', category: 'Dairy', price: 340, brands: ['Amul', 'Gowardhan', 'Patanjali'] },
    { name: 'Paneer 200g', category: 'Dairy', price: 85, brands: ['Amul', 'Gowardhan', 'Mother Dairy'] },
    { name: 'Curd 400g', category: 'Dairy', price: 35, brands: ['Amul', 'Mother Dairy', 'Nestle'] },
    { name: 'Milk 1L', category: 'Dairy', price: 70, brands: ['Amul', 'Nestle', 'Good Life'] },
    { name: 'Flavoured Milk 200ml', category: 'Dairy', price: 30, brands: ['Amul', 'Cavins'] },
    { name: 'Shrikhand 500g', category: 'Dairy', price: 130, brands: ['Amul', 'Warana'] },

    // Snacks
    { name: '2-Minute Noodles', category: 'Snacks', price: 14, brands: ['Maggi', 'Yippee', 'Chings', 'Top Ramen'] },
    { name: 'Noodles Pack of 4', category: 'Snacks', price: 56, brands: ['Maggi', 'Yippee'] },
    { name: 'Bhujia Sev 400g', category: 'Snacks', price: 85, brands: ['Haldiram\'s', 'Bikaji', 'Garden'] },
    { name: 'Aloo Bhujia 200g', category: 'Snacks', price: 45, brands: ['Haldiram\'s', 'Bikaji'] },
    { name: 'Potato Chips', category: 'Snacks', price: 20, brands: ['Lays', 'Balaji', 'Bingo', 'Pringles'] },
    { name: 'Nachos', category: 'Snacks', price: 30, brands: ['Doritos', 'Bingo'] },
    { name: 'Kurkure Masala Munch', category: 'Snacks', price: 20, brands: ['Kurkure'] },
    { name: 'Mixture 400g', category: 'Snacks', price: 80, brands: ['Haldiram\'s', 'Bikaji'] },

    // Biscuits
    { name: 'Marie Gold', category: 'Biscuits', price: 30, brands: ['Britannia', 'Parle'] },
    { name: 'Good Day Butter', category: 'Biscuits', price: 35, brands: ['Britannia'] },
    { name: 'Oreo Original', category: 'Biscuits', price: 40, brands: ['Cadbury'] },
    { name: 'Dark Fantasy', category: 'Biscuits', price: 40, brands: ['Sunfeast'] },
    { name: 'Parle-G', category: 'Biscuits', price: 10, brands: ['Parle'] },
    { name: 'Bourbon', category: 'Biscuits', price: 25, brands: ['Britannia'] },
    { name: 'Digestive', category: 'Biscuits', price: 80, brands: ['Britannia', 'McVities'] },

    // Chocolates
    { name: 'Dairy Milk Silk', category: 'Chocolates', price: 80, brands: ['Cadbury'] },
    { name: 'KitKat', category: 'Chocolates', price: 25, brands: ['Nestle'] },
    { name: 'Munch', category: 'Chocolates', price: 10, brands: ['Nestle'] },
    { name: '5 Star', category: 'Chocolates', price: 20, brands: ['Cadbury'] },
    { name: 'Ferrero Rocher (Pack of 3)', category: 'Chocolates', price: 140, brands: ['Ferrero Rocher'] },

    // Spices
    { name: 'Turmeric Powder 100g', category: 'Spices', price: 35, brands: ['Everest', 'MDH', 'Catch', 'Tata Sampann'] },
    { name: 'Chilli Powder 100g', category: 'Spices', price: 45, brands: ['Everest', 'MDH', 'Catch', 'Tata Sampann'] },
    { name: 'Coriander Powder 100g', category: 'Spices', price: 40, brands: ['Everest', 'MDH'] },
    { name: 'Garam Masala 100g', category: 'Spices', price: 85, brands: ['Everest', 'MDH', 'Badshah'] },
    { name: 'Chicken Masala 100g', category: 'Spices', price: 65, brands: ['Everest', 'MDH', 'Eastern'] },
    { name: 'Sambar Powder 100g', category: 'Spices', price: 55, brands: ['MTR', 'Everest', 'Aachi'] },

    // Beverages
    { name: 'Premium Tea 500g', category: 'Beverages', price: 280, brands: ['Tata Tea', 'Red Label', 'Taj Mahal', 'Wagh Bakri', '3 Roses'] },
    { name: 'Green Tea (25 Bags)', category: 'Beverages', price: 180, brands: ['Lipton', 'Tetley', 'Organic India'] },
    { name: 'Instant Coffee 50g', category: 'Beverages', price: 170, brands: ['Nescafe', 'Bru', 'Sunrise'] },
    { name: 'Filter Coffee 200g', category: 'Beverages', price: 110, brands: ['Bru', 'Narasu\'s'] },
    { name: 'Mango Drink 1.2L', category: 'Beverages', price: 75, brands: ['Maaza', 'Frooti', 'Slice'] },
    { name: 'Cola 2L', category: 'Beverages', price: 95, brands: ['Coca Cola', 'Pepsi', 'Thums Up'] },

    // Household
    { name: 'Detergent Powder 1kg', category: 'Household', price: 120, brands: ['Surf Excel', 'Ariel', 'Tide', 'Rin', 'Henko'] },
    { name: 'Liquid Detergent 1L', category: 'Household', price: 210, brands: ['Surf Excel', 'Ariel', 'Genteel'] },
    { name: 'Dishwash Gel 500ml', category: 'Household', price: 105, brands: ['Vim', 'Pril', 'Exo'] },
    { name: 'Dishwash Bar (Pack of 3)', category: 'Household', price: 45, brands: ['Vim', 'Exo'] },
    { name: 'Floor Cleaner 1L', category: 'Household', price: 190, brands: ['Lizol', 'Domex'] },
    { name: 'Toilet Cleaner 500ml', category: 'Household', price: 95, brands: ['Harpic', 'Domex'] },

    // Personal Care
    { name: 'Toothpaste 150g', category: 'Personal Care', price: 95, brands: ['Colgate', 'Pepsodent', 'Sensodyne', 'Close Up', 'Dabur Red'] },
    { name: 'Bathing Soap (Pack of 4)', category: 'Personal Care', price: 160, brands: ['Dove', 'Pears', 'Dettol', 'Lux', 'Santoor', 'Lifebuoy'] },
    { name: 'Hand Wash 200ml', category: 'Personal Care', price: 90, brands: ['Dettol', 'Lifebuoy', 'Savlon'] },
    { name: 'Shampoo 340ml', category: 'Personal Care', price: 280, brands: ['Dove', 'Head & Shoulders', 'Pantene', 'Clinic Plus', 'Tresemme'] },
    { name: 'Conditioner 180ml', category: 'Personal Care', price: 210, brands: ['Dove', 'Pantene', 'Tresemme'] },
    { name: 'Face Wash 100ml', category: 'Personal Care', price: 140, brands: ['Himalaya', 'Garnier', 'Clean & Clear', 'Nivea'] }
];

const generateProducts = () => {
    let allProducts = [];

    PRODUCTS_TEMPLATE.forEach(template => {
        template.brands.forEach(brand => {
            // Main Product
            allProducts.push({
                name: `${brand} ${template.name}`,
                category: template.category,
                price: template.price, // Base price
                costPrice: Math.round(template.price * 0.85), // 15% margin
                stock: Math.floor(Math.random() * 80) + 10,
                baseDailySales: Math.random() * 2 + 0.5
            });

            // Variation: Saver Pack (20% chance)
            if (Math.random() > 0.8) {
                allProducts.push({
                    name: `${brand} ${template.name} (Saver Pack)`,
                    category: template.category,
                    price: Math.round(template.price * 1.9),
                    costPrice: Math.round(template.price * 1.9 * 0.85),
                    stock: Math.floor(Math.random() * 40) + 5,
                    baseDailySales: Math.random() * 1 + 0.2
                });
            }
            // Variation: Small Pack (20% chance)
            if (Math.random() > 0.8 && template.price > 100) {
                allProducts.push({
                    name: `${brand} ${template.name} (Mini)`,
                    category: template.category,
                    price: Math.round(template.price * 0.55),
                    costPrice: Math.round(template.price * 0.55 * 0.85),
                    stock: Math.floor(Math.random() * 60) + 10,
                    baseDailySales: Math.random() * 1.5 + 0.5
                });
            }
        });
    });

    return allProducts;
};

const generate = async () => {
    try {
        console.log("Starting Realistic Data Generation...");
        console.log("Connecting to MongoDB...", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // 1. Create User
        const email = 'supermarket_demo@msme.com';
        await User.deleteMany({ email }); // Clean slate
        await Product.deleteMany({}); // DELETE ALL OLD PRODUCTS
        await Transaction.deleteMany({}); // DELETE ALL OLD TRANSACTIONS
        const hashedPassword = await bcrypt.hash('password123', 10);

        const user = new User({
            name: 'Apna Supermarket (AI Demo)',
            email: email,
            password: hashedPassword,
            businessName: 'Apna Supermarket',
            businessType: 'Retail',
            sector: 'FMCG',
            location: 'Mumbai, India',
            size: 'Medium',
            annualTurnover: 15000000,
            growthGoals: ['Maximize Profit', 'Reduce Stockouts', 'Expand Delivery'],
            onboardingComplete: true
        });
        await user.save();
        console.log("User Created:", user._id);

        // 2. Generate and Insert Products
        const productTemplates = generateProducts();

        // Ensure we have unique names just in case
        let finalProducts = [...new Map(productTemplates.map(item => [item.name, item])).values()];

        console.log(`Prepared ${finalProducts.length} unique products.`);

        // Insert into DB first to get IDs
        const productDocs = await Product.insertMany(finalProducts.map(p => ({
            userId: user._id,
            name: p.name,
            category: p.category,
            price: p.price,
            costPrice: p.costPrice,
            stock: p.stock,
            reorderLevel: 10,
            lastRestocked: new Date(),
            history: []
        })));

        console.log(`Inserted ${productDocs.length} unique items.`);

        const productsMap = productDocs.map((doc, i) => ({
            _id: doc._id,
            ...finalProducts[i] // has baseDailySales
        }));

        // 3. Simulate 90 Days of Transactions
        const today = new Date();
        let transactions = [];
        let productSalesHistory = {};
        productsMap.forEach(p => productSalesHistory[p._id.toString()] = new Array(90).fill(0));

        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay();

            // Demand Factors
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isSalaryWeek = (date.getDate() <= 7);

            // Randomly determine number of transactions (Footfall)
            // INCREASED for high volume: 200-400 customers/day
            const numCustomers = Math.floor(Math.random() * 200) + 200;

            for (let c = 0; c < numCustomers; c++) {
                // Cart Logic
                const cartSize = Math.floor(Math.random() * 8) + 1; // 1-8 items
                let cartItems = [];
                let totalAmount = 0;
                let totalCost = 0;

                for (let k = 0; k < cartSize; k++) {
                    // SUPER AGGRESSIVE PARETO:
                    // 60% chance to pick from TOP 30 items (Pillars of the store)
                    // 40% chance to pick from the rest
                    let randomProd;
                    if (Math.random() > 0.4) {
                        // Pick from Top 30
                        const topIndex = Math.floor(Math.random() * Math.min(30, productsMap.length));
                        randomProd = productsMap[topIndex];
                    } else {
                        // Pick from rest
                        const restIndex = Math.floor(Math.random() * (productsMap.length - 30)) + 30;
                        randomProd = productsMap[restIndex];
                    }

                    // Qty logic: Boost volume
                    // Top sellers get bulk buys (e.g. 5kg Atta x 2)
                    let qty = 1;
                    const rand = Math.random();
                    if (rand > 0.6) qty = Math.floor(Math.random() * 3) + 2; // 2-4 items
                    if (rand > 0.9) qty = Math.floor(Math.random() * 6) + 4;  // 4-9 items (Bulk)

                    cartItems.push({
                        productId: randomProd._id,
                        name: randomProd.name,
                        quantity: qty,
                        price: randomProd.price,
                        costPrice: randomProd.costPrice
                    });

                    totalAmount += randomProd.price * qty;
                    totalCost += randomProd.costPrice * qty;

                    const historyIndex = 89 - i;
                    const prodIdStr = randomProd._id.toString();
                    if (productSalesHistory[prodIdStr][historyIndex] === undefined) {
                        productSalesHistory[prodIdStr][historyIndex] = 0;
                    }
                    productSalesHistory[prodIdStr][historyIndex] += qty;
                }

                transactions.push({
                    userId: user._id,
                    date: date,
                    type: 'Income',
                    amount: totalAmount,
                    totalCost: totalCost,
                    profit: totalAmount - totalCost,
                    category: 'Sales',
                    paymentMethod: Math.random() > 0.3 ? 'UPI' : 'Cash',
                    products: cartItems,
                    desc: `Sale: ${cartItems.length} items`
                });
            }
        }

        console.log(`Generated ${transactions.length} transactions across 90 days.`);
        await Transaction.insertMany(transactions);

        // 4. Update Products
        const updateOps = productsMap.map(p => ({
            updateOne: {
                filter: { _id: p._id },
                update: {
                    $set: {
                        history: productSalesHistory[p._id.toString()],
                        stock: Math.floor(Math.random() * 80) + 10
                    }
                }
            }
        }));

        await Product.bulkWrite(updateOps);

        console.log("------------------------------------------");
        console.log(" GENERATION COMPLETE ");
        console.log(" User: supermarket_demo@msme.com");
        console.log(" Pass: password123");
        console.log(` Total Products: ${productDocs.length}`);
        console.log("------------------------------------------");

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

generate();
