const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { calculateGST } = require('../utils/tax_engine');

// Get all transactions for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Sort by date DESC, then by creation time (_id) DESC to show newest first.
        // Limit to 500 to prevent browser crash from massive dataset.
        const transactions = await Transaction.find({ userId })
            .sort({ date: -1, _id: -1 })
            .limit(500);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Add new transaction
router.post('/add', async (req, res) => {
    const { userId, date, desc, type, amount, category } = req.body;

    try {
        const newTransaction = new Transaction({
            userId,
            date: date || new Date(),
            desc,
            type, // 'Income' or 'Expense'
            amount: parseFloat(amount),
            category: category || 'General' // Ensure category is saved
        });

        const saved = await newTransaction.save();
        res.json({ msg: 'Transaction added', transaction: saved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
