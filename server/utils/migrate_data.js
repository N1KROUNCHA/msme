require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected for Migration');
        // DEBUG: Write Transaction Schema to file
        const schemaType = Transaction.schema.path('type');
        fs.writeFileSync('debug_schema.txt', JSON.stringify(schemaType, null, 2));
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

// Read db.json
const dbPath = path.join(__dirname, '..', 'db.json');
const rawData = fs.readFileSync(dbPath);
const db = JSON.parse(rawData);

const migrate = async () => {
    try {
        // Clear existing data (optional, but good for clean slate)
        await User.deleteMany({});
        await Product.deleteMany({});
        await Transaction.deleteMany({});
        console.log('Cleared existing MongoDB collections');

        // Migrate Users
        // Create a mapping of old string IDs to new ObjectId for references
        const userIdMap = {};

        for (const user of db.users) {
            try {
                // Map 'type' from db.json to 'businessType' if schema expects it, or keep 'type'
                // We will check schema via view_file results, but strictly saving what is in db.json for now
                // plus handling the schema field names.

                // Assuming schema might have 'businessType' instead of 'type' based on my suspicious thought
                const userData = { ...user };
                if (userData.type && !userData.businessType) {
                    userData.businessType = userData.type; // Polyfill just in case
                }
                delete userData._id; // Let Mongoose generate a new ObjectId

                const newUser = new User(userData);
                const savedUser = await newUser.save();
                userIdMap[user._id] = savedUser._id;
                console.log(`Migrated User: ${user.name}`);
            } catch (uErr) {
                fs.appendFileSync('migration_errors.log', `FAIL User ${user.name}: ${uErr.message}\n`);
                console.error(`Failed to migrate user ${user.name}:`, uErr.message);
            }
        }

        // Migrate Products
        if (db.products) {
            for (const prod of db.products) {
                if (userIdMap[prod.userId]) {
                    const prodData = { ...prod };
                    delete prodData._id; // Let Mongoose generate a new ObjectId

                    const newProd = new Product({
                        ...prodData,
                        userId: userIdMap[prod.userId],
                        // Ensure price/stock are numbers
                        price: Number(prod.price),
                        stock: Number(prod.stock),
                    });
                    await newProd.save();
                } else {
                    console.warn(`Skipping Product ${prod.name} (User ID ${prod.userId} not found)`);
                }
            }
            console.log(`Migrated ${db.products.length} Products`);
        }

        // Migrate Transactions
        if (db.transactions) {
            for (const txn of db.transactions) {
                try {
                    if (userIdMap[txn.userId]) {
                        const txnData = { ...txn };
                        delete txnData._id; // Let Mongoose generate a new ObjectId

                        const newTxn = new Transaction({
                            ...txnData,
                            userId: userIdMap[txn.userId],
                            date: new Date(txn.date),
                            amount: Number(txn.amount)
                        });
                        await newTxn.save();
                    } else {
                        // Log warning to file
                        fs.appendFileSync('migration_errors.log', `SKIP Transaction: User ID ${txn.userId} not found\n`);
                    }
                } catch (tErr) {
                    fs.appendFileSync('migration_errors.log', `FAIL Transaction ${txn._id}: ${tErr.message}\n`);
                }
            }
            console.log(`Migrated Transactions`);
        }

        console.log('Migration Completed');
        process.exit(0);
    } catch (err) {
        fs.appendFileSync('migration_errors.log', `FATAL: ${err.message}\n`);
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrate();
