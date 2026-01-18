const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Refined Import'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const results = [];
const BATCH_SIZE = 500;
let productCache = new Map(); // Name -> ID
let merchantId = null;

async function getMerchantUser() {
    // 1. Define the dedicated "AI Research" user
    const email = "supermarket@ai.research";
    let user = await User.findOne({ email });

    if (user) {
        console.log("Found existing Supermarket User. Cleaning old data...");
        // Clean up previous imports for this user only to ensure a fresh dataset
        try {
            await Transaction.deleteMany({ userId: user._id });
            await Product.deleteMany({ userId: user._id });
            console.log("Old data cleared.");
        } catch (e) {
            console.error("Error clearing data:", e);
        }
        return user._id;
    }

    // 2. Create if not exists
    console.log("Creating new Supermarket AI User...");
    const newUser = new User({
        name: "AI Supermarket Lab",
        email: email,
        password: "password123",
        businessName: "Kaggle Superstore India",
        businessType: "Modern Retail",
        size: "Enterprise",
        role: "admin"
    });
    await newUser.save();
    return newUser._id;
}

async function run() {
    try {
        merchantId = await getMerchantUser();
        console.log(`Importing refined data for Merchant ID: ${merchantId}`);

        const stream = fs.createReadStream(path.join(__dirname, '..', 'Indian_Store_Data.csv'))
            .pipe(csv());

        let batch = [];
        let processedCount = 0;
        let ignoredCount = 0;

        for await (const row of stream) {
            // FILTER FOR REALISM: Only import 'Maharashtra' to simulate one store location
            if (row['State'] !== 'Maharashtra') {
                ignoredCount++;
                continue;
            }

            batch.push(row);
            if (batch.length >= BATCH_SIZE) {
                await processBatchRows(batch);
                processedCount += batch.length;
                console.log(`Processed ${processedCount} records... (Ignored ${ignoredCount} other states)`);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await processBatchRows(batch);
            processedCount += batch.length;
            console.log(`Processed ${processedCount} records...`);
        }

        console.log('Import Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Import Failed:', error);
        process.exit(1);
    }
}

async function processBatchRows(rows) {
    // 1. Identify unique products in this batch
    const uniqueProductsInBatch = new Set();
    rows.forEach(r => uniqueProductsInBatch.add(r['Product Name']));


    for (const pName of uniqueProductsInBatch) {
        if (!productCache.has(pName)) {
            // Double check DB
            let p = await Product.findOne({ name: pName, userId: merchantId });
            if (!p) {
                // Find price from the first row that has this product
                const sampleRow = rows.find(r => r['Product Name'] === pName);
                const qty = parseInt(sampleRow['Quantity']) || 1;
                const sales = parseFloat(sampleRow['Sales']);

                // Heuristic Validation: If Price < 10, it might be data error or cheap item. Keep it but ensure valid.
                let unitPrice = qty > 0 ? (sales / qty) : 0;
                unitPrice = parseFloat(unitPrice.toFixed(2));

                // Dynamic Reorder Level: 
                // If historical order quantity is high, we need higher buffer.
                // Let's take 'Quantity' as a demand signal.
                const reorderLevel = Math.max(5, qty * 2 + Math.floor(Math.random() * 5));

                p = await new Product({
                    name: pName,
                    category: sampleRow['Category of Goods'] || 'General',
                    price: unitPrice,
                    // Initial Stock: Random but healthy enough to not be immediately critical
                    stock: Math.floor(Math.random() * 50) + reorderLevel + 10,
                    userId: merchantId,
                    reorderLevel: reorderLevel
                }).save();
            }
            productCache.set(pName, p._id);
        }
    }

    // 3. Create Transactions
    const transactionDocs = rows.map(row => {
        const pId = productCache.get(row['Product Name']);

        // DATE SHIFT LOGIC: 2019-2023 -> 2024-2026
        // Parse original date (assuming standard formats or Date constructor can handle it)
        let originalDate = new Date(row['Order Date'] || Date.now());
        if (isNaN(originalDate.getTime())) originalDate = new Date(); // Fallback

        const shiftedDate = new Date(originalDate);
        shiftedDate.setFullYear(originalDate.getFullYear() + 3);

        return {
            userId: merchantId,
            products: [{
                productId: pId,
                name: row['Product Name'],
                quantity: parseInt(row['Quantity']) || 1,
                price: parseFloat(row['Sales']) / (parseInt(row['Quantity']) || 1)
            }],
            amount: parseFloat(row['Sales']),
            type: 'Income', // Sales are income
            status: 'Completed',
            paymentMethod: 'Cash', // Default
            date: shiftedDate,
            desc: `Sale to ${row['Customer Name']} ${row['Last Name']} (${row['City'] || 'Store'})`
        };
    });

    await Transaction.insertMany(transactionDocs);
}

run();
