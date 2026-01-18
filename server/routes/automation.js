const express = require('express');
const router = express.Router();
const axios = require('axios');

// Webhook URL (Placeholder for n8n/Zapier)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.your-instance.com/webhook/inventory-alert";

router.post('/trigger/low-stock', async (req, res) => {
    const { userId, product, stock } = req.body;
    try {
        console.log(`Triggering Automation for ${product}...`);
        // In real setup, axios.post(N8N_WEBHOOK_URL, { userId, product, stock, alertType: 'LOW_STOCK' });
        res.json({ status: 'Automation Trigger Sent', alert: `Low stock alert for ${product} (${stock} left)` });
    } catch (err) {
        res.status(500).json({ error: 'Webhook failed' });
    }
});

router.post('/trigger/daily-report', async (req, res) => {
    const { userId, totalSales } = req.body;
    try {
        res.json({ status: 'Report Automation Triggered', alert: `Daily summary for user ${userId} sent to WhatsApp.` });
    } catch (err) {
        res.status(500).json({ error: 'Report Webhook failed' });
    }
});

module.exports = router;
