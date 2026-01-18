const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Helper to format dates
const formatDate = (date) => date.toISOString().split('T')[0];

// Get Dashboard Summary
router.get('/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get Data
        const transactions = await Transaction.find({ userId });

        // Calculate Revenue (Monthly Sales)
        const incomeTx = transactions.filter(t => t.type === 'Income');
        const expenseTx = transactions.filter(t => t.type === 'Expense');

        const monthlySales = incomeTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        // Fallback: If totalCost is missing, derive it from amount - profit
        const monthlyCOGS = incomeTx.reduce((acc, t) => acc + (Number(t.totalCost) || (Number(t.amount) - Number(t.profit)) || 0), 0);
        // Fallback: If amount is missing for expense, use profit (absolute)
        const operatingExpenses = expenseTx.reduce((acc, t) => acc + (Number(t.amount) || Math.abs(Number(t.profit)) || 0), 0);

        console.log(`[Dashboard] User: ${userId} - Sales: ${monthlySales}, COGS: ${monthlyCOGS}, OpEx: ${operatingExpenses}`);

        // Net Profit = (Sales - COGS) - OpEx
        // Or simply sum the 'profit' field which we've carefully populated
        const netProfit = transactions.reduce((acc, t) => acc + (t.profit || 0), 0);

        // Inventory
        const userProducts = await Product.find({ userId });
        const lowStockCount = userProducts.filter(p => p.stock <= (p.reorderLevel || 10)).length;

        // Category Breakdown for Expenses
        const expenseBreakdown = {};
        expenseTx.forEach(t => {
            const cat = t.category || "General Ops";
            expenseBreakdown[cat] = (expenseBreakdown[cat] || 0) + t.amount;
        });

        res.json({
            monthlySales: Math.round(monthlySales),
            monthlyCOGS: Math.round(monthlyCOGS),
            operatingExpenses: Math.round(operatingExpenses),
            profit: Math.round(netProfit),
            moneyFlow: Math.round(netProfit), // Aliasing for frontend compatibility
            lowStockCount: lowStockCount,
            expenseBreakdown: Object.entries(expenseBreakdown).map(([name, value]) => ({ name, value }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Comparative Data for Chart with Timeframe
router.get('/sales-chart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe } = req.query;

        const transactions = await Transaction.find({ userId });

        let labels = [];
        let incomeData = [];
        let expenseData = [];
        let profitData = [];
        const now = new Date();

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
