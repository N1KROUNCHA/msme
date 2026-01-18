const express = require('express');
const Transaction = require('../models/Transaction');
const axios = require('axios');
const router = express.Router();
const Product = require('../models/Product');

// Get all products (User specific)
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Strictly filter by userId.
        const products = await Product.find({ userId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Restock
router.post('/restock', async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    console.log(`[Inventory] Restocking product ${productId} with qty ${qty}`);

    try {
        const product = await Product.findById(productId);

        if (!product) {
            console.error(`[Inventory] Restock failed: Product ${productId} not found`);
            return res.status(404).json({ msg: 'Product not found' });
        }

        const costAmount = (product.costPrice || product.price * 0.8) * qty;

        // 1. Update stock
        product.stock += qty;
        product.lastRestocked = new Date();

        const savedProduct = await product.save();
        console.log(`[Inventory] Stock updated for ${product.name}. New stock: ${product.stock}`);

        // 2. Log Finance Transaction (Expense)
        const transaction = new Transaction({
            userId: product.userId,
            date: new Date(),
            desc: `Restock: ${product.name} (Qty: ${qty})`,
            type: 'Expense',
            amount: costAmount,
            category: 'Inventory Restock',
            products: [{
                productId: product._id,
                name: product.name,
                quantity: qty,
                price: product.price,
                costPrice: product.costPrice || product.price * 0.8
            }]
        });
        await transaction.save();
        console.log(`[Inventory] Finance transaction logged for restock: ₹${costAmount}`);

        res.json({ msg: 'Stock updated', product: savedProduct });
    } catch (err) {
        console.error(`[Inventory] Restock error:`, err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Sell Product
router.post('/sell', async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    console.log(`[Inventory] Selling product ${productId} with qty ${qty}`);

    try {
        const product = await Product.findById(productId);

        if (!product) {
            console.error(`[Inventory] Sale failed: Product ${productId} not found`);
            return res.status(404).json({ msg: 'Product not found' });
        }

        if (product.stock < qty) {
            console.warn(`[Inventory] Sale failed: Out of stock for ${product.name} (Available: ${product.stock}, Req: ${qty})`);
            return res.status(400).json({ msg: 'Out of stock' });
        }

        const sellAmount = product.price * qty;
        const costAmount = (product.costPrice || product.price * 0.8) * qty;
        const profit = sellAmount - costAmount;

        // 1. Update stock
        product.stock -= qty;
        const savedProduct = await product.save();
        console.log(`[Inventory] Stock updated for ${product.name}. New stock: ${product.stock}`);

        // 2. Log Finance Transaction (Income)
        const transaction = new Transaction({
            userId: product.userId,
            date: new Date(),
            desc: `Sale: ${product.name} (Qty: ${qty})`,
            type: 'Income',
            amount: sellAmount,
            category: 'Sales',
            profit: profit,
            totalCost: costAmount,
            products: [{
                productId: product._id,
                name: product.name,
                quantity: qty,
                price: product.price,
                costPrice: product.costPrice || product.price * 0.8
            }]
        });
        await transaction.save();
        console.log(`[Inventory] Finance transaction logged for sale: ₹${sellAmount}, Profit: ₹${profit}`);

        res.json({ msg: 'Sale recorded', product: savedProduct, transaction });
    } catch (err) {
        console.error(`[Inventory] Sale error:`, err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Bulk Sell (Multiple items in one bill)
router.post('/bulk-sell', async (req, res) => {
    const { userId, items, customerName, customerPhone } = req.body;
    // items: [{ productId, quantity }]

    console.log(`[Inventory] Bulk Sale for ${customerName} (${items.length} items)`);

    try {
        let totalSellAmount = 0;
        let totalCostAmount = 0;
        let processedProducts = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new Error(`Out of stock for ${product.name}`);

            const lineSell = product.price * item.quantity;
            const lineCost = (product.costPrice || product.price * 0.8) * item.quantity;

            product.stock -= item.quantity;
            await product.save();

            totalSellAmount += lineSell;
            totalCostAmount += lineCost;

            processedProducts.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                costPrice: product.costPrice || product.price * 0.8
            });
        }

        const profit = totalSellAmount - totalCostAmount;

        // Create transaction
        const transaction = new Transaction({
            userId,
            customerName,
            customerPhone,
            date: new Date(),
            desc: `Invoice Sale: ${items.length} items`,
            type: 'Income',
            amount: totalSellAmount,
            category: 'Sales',
            profit: profit,
            totalCost: totalCostAmount,
            products: processedProducts
        });

        await transaction.save();
        console.log(`[Inventory] Bulk Sale successful: ₹${totalSellAmount} for ${customerName}`);

        res.json({ msg: 'Bulk sale recorded', transaction });
    } catch (err) {
        console.error(`[Inventory] Bulk Sale error:`, err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Add New Product
router.post('/add', async (req, res) => {
    const { name, category, stock, reorderLevel, price, costPrice, userId } = req.body;

    try {
        const newProduct = new Product({
            userId: userId || null,
            name,
            category,
            stock: parseInt(stock),
            reorderLevel: parseInt(reorderLevel),
            price: parseFloat(price),
            costPrice: parseFloat(costPrice)
        });

        const saved = await newProduct.save();
        res.json({ msg: 'Product added', product: saved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get High Demand / Trending Products (Market Alerts)
router.get('/market/alerts', async (req, res) => {
    try {
        // Find products with stock <= reorderLevel from ANY user
        // Using $expr to compare two fields in the same document
        const highDemandProducts = await Product.find({
            $expr: { $lte: ["$stock", "$reorderLevel"] }
        });

        const highDemand = highDemandProducts.map(p => ({
            productName: p.name,
            price: p.price,
            status: 'High Demand (Low Stock)',
            sellerId: p.userId
        }));

        res.json(highDemand);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get Suppliers based on Business Type
router.get('/suppliers/list', (req, res) => {
    const { type } = req.query; // e.g., 'Distribution', 'Wholesale', 'Retail'

    // Mock Suppliers Database
    const suppliers = [
        { id: 1, name: 'Global Distributors Ltd', type: 'Distribution', rating: 4.5 },
        { id: 2, name: 'Local Farm Fresh', type: 'Wholesale', rating: 4.8 },
        { id: 3, name: 'City Retail Supplies', type: 'Retail', rating: 4.2 },
        { id: 4, name: 'Tech Components Inc', type: 'Distribution', rating: 4.7 }
    ];

    if (type) {
        return res.json(suppliers.filter(s => s.type.toLowerCase() === type.toLowerCase()));
    }

    res.json(suppliers);
});

// @route   POST api/inventory/replenish
// @desc    Trigger AI Agent to analyze stock and order
// @access  Private (Temporarily Public for Demo)
router.post('/replenish', async (req, res) => {
    try {
        const { userId } = req.body; // Expect userId in body for now

        // 1. Fetch current stock state
        const products = await Product.find({ userId: userId });

        // 2. Prepare payload for AI Agent
        const agentPayload = {
            products: products.map(p => ({
                name: p.name,
                current_stock: p.stock,
                reorder_level: p.reorderLevel || 10,
                price: p.price,
                avg_daily_sales: Math.random() * 5
            }))
        };

        // 3. Call Python AI Service
        try {
            const aiResponse = await axios.post('http://localhost:8000/agent/replenish', agentPayload);
            res.json(aiResponse.data);
        } catch (aiError) {
            console.error("AI Service Error:", aiError.message);
            res.status(503).json({ msg: "AI Brain is offline or unreachable", error: aiError.message });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
