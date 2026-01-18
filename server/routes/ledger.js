const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Get all ledger customers
router.get('/customers/:userId', async (req, res) => {
    try {
        const customers = await Credit.find({ userId: req.params.userId }).sort({ totalUdhaar: -1 });
        res.json(customers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add new Udhaar transaction
router.post('/add', async (req, res) => {
    try {
        const { userId, customerName, customerPhone, amount, type, desc } = req.body;

        let entry = await Credit.findOne({ userId, customerName });

        if (!entry) {
            entry = new Credit({ userId, customerName, customerPhone, transactions: [] });
        }

        entry.transactions.push({ amount, type, desc, date: new Date() });

        if (type === 'credit') {
            entry.totalUdhaar += Number(amount);
        } else {
            entry.totalUdhaar -= Number(amount);
        }

        // Trigger AI Analysis for Risk
        try {
            const aiRes = await axios.post(`${AI_SERVICE_URL}/agent/credit/analyze`, {
                history: entry.transactions,
                total_debt: entry.totalUdhaar
            });
            entry.riskScore = aiRes.data.risk_score;
            entry.recoveryProbability = aiRes.data.recovery_prob;
            entry.lastAnalysisDate = new Date();
        } catch (aiErr) {
            console.warn("AI Credit Analysis failed, using heuristics");
            entry.riskScore = entry.totalUdhaar > 5000 ? 0.7 : 0.2;
        }

        await entry.save();
        res.json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
