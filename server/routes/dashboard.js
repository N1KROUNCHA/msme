const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Helper to format dates
const formatDate = (date) => date.toISOString().split('T')[0];

// Get Dashboard Summary
// Get Dashboard Summary (High Performance Aggregation)
router.get('/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const mongoose = require('mongoose');

        // Performance: Only analyze last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Aggregation Pipeline for Financials
        const financials = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] }
                    },
                    totalCOGS: {
                        $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$totalCost", 0] }
                    },
                    totalOpEx: {
                        $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] }
                    },
                    netProfit: { $sum: "$profit" }
                }
            }
        ]);

        const stats = financials[0] || { totalSales: 0, totalCOGS: 0, totalOpEx: 0, netProfit: 0 };

        // Inventory Count (Efficient)
        const lowStockCount = await Product.countDocuments({
            userId,
            $expr: { $lte: ["$stock", { $ifNull: ["$reorderLevel", 10] }] }
        });

        // Expense Breakdown (Aggregation)
        const expenseBreakdownRaw = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "Expense",
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $ifNull: ["$category", "General Ops"] },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const expenseBreakdown = expenseBreakdownRaw.map(e => ({ name: e._id, value: e.total }));

        res.json({
            monthlySales: Math.round(stats.totalSales),
            monthlyCOGS: Math.round(stats.totalCOGS),
            operatingExpenses: Math.round(stats.totalOpEx),
            profit: Math.round(stats.netProfit),
            moneyFlow: Math.round(stats.netProfit),
            lowStockCount: lowStockCount,
            expenseBreakdown: expenseBreakdown
        });

    } catch (err) {
        console.error("Dashboard Summary Error:", err);
        res.status(500).send('Server Error');
    }
});

// Get Comparative Data for Chart with Timeframe
router.get('/sales-chart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe } = req.query;

        // Performance: Only fetch relevant data based on timeframe
        const now = new Date();
        let startDate = new Date(now);

        if (timeframe === 'daily') {
            startDate.setDate(now.getDate() - 7);
        } else if (timeframe === 'weekly') {
            startDate.setDate(now.getDate() - 28);
        } else {
            startDate.setMonth(now.getMonth() - 6);
        }

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startDate }
        }).sort({ date: -1 }).lean();

        let labels = [];
        let incomeData = [];
        let expenseData = [];
        let profitData = [];


        if (timeframe === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                const weekLabel = `Week ${4 - i}`;
                labels.push(weekLabel);

                const weekTx = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    const diffDays = Math.ceil(Math.abs(now - tDate) / (1000 * 60 * 60 * 24));
                    return diffDays > (i * 7) && diffDays <= ((i + 1) * 7);
                });

                incomeData.push(weekTx.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0));
                expenseData.push(weekTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0));
                profitData.push(weekTx.reduce((sum, t) => sum + (t.profit || 0), 0));
            }
        } else if (timeframe === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const dateStr = formatDate(d);
                labels.push(dateStr);

                const dayTx = transactions.filter(t => formatDate(new Date(t.date)) === dateStr);

                incomeData.push(dayTx.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0));
                expenseData.push(dayTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0));
                profitData.push(dayTx.reduce((sum, t) => sum + (t.profit || 0), 0));
            }
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(now.getMonth() - i);
                const monthName = months[d.getMonth()];
                labels.push(monthName);

                const monthTx = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
                });

                incomeData.push(monthTx.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0));
                expenseData.push(monthTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0));
                profitData.push(monthTx.reduce((sum, t) => sum + (t.profit || 0), 0));
            }
        }

        res.json({ labels, incomeData, expenseData, profitData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
