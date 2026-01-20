const express = require('express');
const router = express.Router();
const NetworkNode = require('../models/NetworkNode');

// Get all neighbors
router.get('/nodes', async (req, res) => {
    try {
        const nodes = await NetworkNode.find().sort({ type: 1 });
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch network nodes' });
    }
});

// Real-Time Simulation Feed
// This endpoint simulates ONE random transaction between nodes or updates status
router.get('/live-feed', async (req, res) => {
    try {
        const nodes = await NetworkNode.find();
        if (nodes.length < 2) return res.json({ event: null, nodes });

        // Randomly pick a node to generate a Demand Signal
        // This simulates a neighbor shouting: "I need 20kg Rice! Who has it?"
        const node = nodes[Math.floor(Math.random() * nodes.length)];

        // Randomly pick an item from their inventory to demand (or generic)
        const product = node.inventory.length > 0
            ? node.inventory[Math.floor(Math.random() * node.inventory.length)]
            : { name: 'Rice (25kg)', stock: 0 };

        // Generate Demand Signal based on FORECAST (Simple Moving Average of History)
        let forecast = 15; // default fallback

        // Calculate Moving Average if history exists
        if (node.salesHistory && node.salesHistory.length > 5) {
            const recent = node.salesHistory.slice(0, 5); // Take last 5 days
            const avg = recent.reduce((a, b) => a + b.sales, 0) / recent.length;
            forecast = Math.ceil(avg * 1.1); // add 10% buffer
        }

        const demandQty = forecast;

        // Update Activity Text
        node.lastActivity = `AI Forecasted demand: ${demandQty} ${product.name}`;
        await node.save();

        const event = {
            id: Date.now(),
            message: `🤖 ${node.name}: Forecasted High Demand for ${product.name} (~${demandQty} units)`,
            timestamp: new Date(),
            nodeId: node._id,
            type: 'forecast'
        };

        return res.json({
            event,
            nodes: await NetworkNode.find().sort({ type: 1 })
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Simulation Error' });
    }
});

module.exports = router;
