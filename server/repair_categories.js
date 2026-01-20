const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const repairCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Find expenses with missing or null category
        const expenses = await Transaction.find({
            type: 'Expense',
            $or: [
                { category: { $exists: false } },
                { category: null },
                { category: "" }
            ]
        });

        console.log(`Found ${expenses.length} expenses with missing categories.`);

        let updatedCount = 0;
        for (const t of expenses) {
            let newCat = "General Ops";
            const desc = t.desc.toLowerCase();

            if (desc.includes('salary')) newCat = "Salary";
            else if (desc.includes('rent')) newCat = "Rent";
            else if (desc.includes('bill') || desc.includes('electr') || desc.includes('water') || desc.includes('util')) newCat = "Utilities";
            else if (desc.includes('market') || desc.includes('ad') || desc.includes('promo')) newCat = "Marketing";
            else if (desc.includes('mainten') || desc.includes('repair')) newCat = "Maintenance";
            else if (desc.includes('inventory') || desc.includes('stock') || desc.includes('purchase')) newCat = "Inventory";
            else if (desc.includes('furniture')) newCat = "Furniture"; // As per user context

            t.category = newCat;
            await t.save();
            updatedCount++;
            process.stdout.write(`\rFixed: ${updatedCount}/${expenses.length}`);
        }

        console.log(`\nRepaired ${updatedCount} transactions.`);
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

repairCategories();
