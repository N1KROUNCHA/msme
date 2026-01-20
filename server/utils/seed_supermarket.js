require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const seedSupermarket = async () => {
    try {
        console.log("Connecting to MongoDB...", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected.');

        // 1. Create User
        const email = 'supermarket_demo@msme.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log("Creating new user...");
            const hashedPassword = await bcrypt.hash('password123', 10);
            user = new User({
                name: 'India Supermarket (Demo)',
                email: email,
                password: hashedPassword,
                businessName: 'Apna Supermarket',
                businessType: 'Retail',
                sector: 'FMCG',
                location: 'Mumbai, India',
                size: 'Medium',
                annualTurnover: 5000000,
                growthGoals: ['Expand to new location', 'Increase online sales'],
                onboardingComplete: true
            });
            await user.save();
            console.log("User created:", user._id);
        } else {
            console.log("User already exists:", user._id);
        }

        // 2. Load Products
        const dataPath = path.join(__dirname, 'supermarket_data.json');
        if (!fs.existsSync(dataPath)) {
            console.error("Data file not found at:", dataPath);
            process.exit(1);
        }

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const productsData = JSON.parse(rawData);

        console.log(`Loaded ${productsData.length} products to seed.`);

        // 3. Clear existing products for this user to avoid dupe
        const deleteRes = await Product.deleteMany({ userId: user._id });
        console.log(`Deleted ${deleteRes.deletedCount} existing products for this user.`);

        // 4. Transform and Insert
        const productsToInsert = productsData.map(p => ({
            userId: user._id,
            name: p.name,
            category: p.category,
            price: p.price,
            costPrice: p.costPrice,
            stock: p.stock,
            reorderLevel: Math.floor(p.stock * 0.2), // Auto set reorder level
            lastRestocked: new Date(),
            history: p.history // Store the realistic 60-day history we generated
        }));

        // For now, let's Insert Products so Inventory is populated.
        await Product.insertMany(productsToInsert);
        console.log(`Successfully inserted ${productsToInsert.length} products.`);

        console.log("Seeding Complete. Please login as:", email);
        console.log("Password: password123");

        process.exit(0);

    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seedSupermarket();
