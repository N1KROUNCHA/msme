const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // aggregate distinct categories for expenses
        const categories = await Transaction.find({ type: 'Expense' }).distinct('category');
        const breakdown = {};

        // Also check if my fallback logic (using desc) creates more "virtual" categories
        const expenses = await Transaction.find({ type: 'Expense' });
        expenses.forEach(t => {
            let cat = t.category;
            if (!cat && t.desc) {
                cat = t.desc.charAt(0).toUpperCase() + t.desc.slice(1);
            }
            cat = cat || "General Ops";
            breakdown[cat] = (breakdown[cat] || 0) + 1;
        });

        console.log("Distinct Categories in DB:", categories);
        console.log("Effective Breakdown Keys:", Object.keys(breakdown));
        console.log("Count:", Object.keys(breakdown).length);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCategories();
