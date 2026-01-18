const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   POST api/ai/pricing/optimize
// @desc    Get pricing suggestions from AI Brain
// @access  Private
router.post('/pricing/optimize', async (req, res) => {
    try {
        const aiResponse = await axios.post('http://127.0.0.1:8000/pricing/optimize', req.body);
        res.json(aiResponse.data);
    } catch (err) {
        console.error("AI Pricing Error:", err.message);
        res.status(500).json({ msg: 'AI Pricing Service Unreachable' });
    }
});

// @route   POST api/ai/vision/analyze
// @desc    Analyze shelf image with Computer Vision
// @access  Private
const multer = require('multer');
const upload = multer();
const FormData = require('form-data');

router.post('/vision/analyze', upload.single('image'), async (req, res) => {
    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: req.file.originalname });

        const aiResponse = await axios.post('http://127.0.0.1:8000/vision/analyze', formData, {
            headers: formData.getHeaders()
        });

        res.json(aiResponse.data);
    } catch (err) {
        console.error("AI Vision Error:", err.message);
        res.status(500).json({ msg: 'Vision Service Unreachable' });
    }
});

// @route   POST api/ai/policy
// @desc    Query MSME Policy Expert (RAG)
// @access  Private
router.post('/policy', async (req, res) => {
    try {
        const { query } = req.body;
        const aiResponse = await axios.post('http://127.0.0.1:8000/agent/policy', { query });
        res.json(aiResponse.data);
    } catch (err) {
        console.error("AI Policy Error:", err.message);
        res.status(500).json({ msg: 'Policy Service Unreachable' });
    }
});

module.exports = router;
