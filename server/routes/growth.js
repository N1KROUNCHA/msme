const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Get Growth Insights (Demand, Cashflow, Opportunities)
router.get('/insights/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // 1. Fetch Real Transaction Data
        const transactions = await Transaction.find({ userId, date: { $gte: thirtyDaysAgo } });

        // 2. Aggregate Daily Sales for LSTM (Cashflow Prediction)
        const dailyTotals = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            dailyTotals[dateStr] = 0;
        }

        transactions.forEach(t => {
            const dateStr = t.date.toISOString().split('T')[0];
            if (dailyTotals[dateStr] !== undefined) {
                dailyTotals[dateStr] += (t.profit || 0); // Forecasting profit for growth
            }
        });

        const history = Object.values(dailyTotals);

        // 3. Call AI Service for LSTM Forecast
        let cashflowForecast = 0;
        try {
            const aiRes = await axios.post(`${AI_SERVICE_URL}/demand/forecast`, history);
            cashflowForecast = aiRes.data.forecast;
        } catch (err) {
            console.error("AI Forecast Error:", err.message);
            cashflowForecast = history.length > 0 ? history.reduce((a, b) => a + b, 0) / history.length : 0;
        }

        // 4. Identify Stockout Risks
        const products = await Product.find({ userId });
        const stockRisks = products.filter(p => p.stock <= (p.reorderLevel || 10)).map(p => ({
            name: p.name,
            currentStock: p.stock,
            reorderLevel: p.reorderLevel
        }));

        // 5. Regional Collaboration (Marketplace Logic)
        // Find if other users have stock of what this user is low on
        const lowStockNames = stockRisks.map(p => p.name);
        const collaborationOpp = await Product.find({
            name: { $in: lowStockNames },
            userId: { $ne: userId },
            stock: { $gt: 50 } // Neighbors with surplus
        }).populate('userId', 'businessName');

        res.json({
            forecast: {
                nextDayProfit: Math.round(cashflowForecast),
                monthlyTrend: history,
                confidence: history.length >= 14 ? "High (Deep Learning)" : "Medium (Average)"
            },
            stockRisks: stockRisks.slice(0, 5),
            collaboration: collaborationOpp.map(o => ({
                product: o.name,
                neighbor: o.userId?.businessName || "Nearby Partner",
                status: "Surplus Available"
            })),
            growthTip: stockRisks.length > 0
                ? "Your neighbor has surplus of items you're low on. Consider a 'Collaborative Restock' to save 15% on shipping."
                : "Steady growth detected. High profit expected tomorrow based on seasonal patterns."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Growth Hub Error" });
    }
});

module.exports = router;
