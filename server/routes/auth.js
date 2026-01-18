const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, businessName, type, sector, location, size } = req.body;

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            businessType: type,
            businessName,
            sector: sector || 'General',
            location: location || 'India',
            size: size || 'Micro',
            onboardingComplete: false
        });
        const savedUser = await newUser.save();

        // SEED INITIAL INVENTORY BASED ON BUSINESS TYPE
        let starterProducts = [];

        switch (type) {
            case 'Fruits & Vegetables':
                starterProducts = [
                    { name: 'Onions (kg)', stock: 50, price: 40, reorderLevel: 10, status: 'Good' },
                    { name: 'Potatoes (kg)', stock: 60, price: 30, reorderLevel: 15, status: 'Good' },
                    { name: 'Tomatoes (kg)', stock: 20, price: 25, reorderLevel: 10, status: 'Good' },
                    { name: 'Bananas (Dozen)', stock: 25, price: 60, reorderLevel: 8, status: 'Good' }
                ];
                break;
            case 'Grocery / Kirana':
                starterProducts = [
                    { name: 'Rice (25kg Bag)', stock: 10, price: 1250, reorderLevel: 3, status: 'Good' },
                    { name: 'Sunflower Oil (1L)', stock: 30, price: 140, reorderLevel: 10, status: 'Good' },
                    { name: 'Sugar (kg)', stock: 40, price: 45, reorderLevel: 10, status: 'Good' },
                    { name: 'Toor Dal (kg)', stock: 25, price: 110, reorderLevel: 5, status: 'Good' },
                    { name: 'Tea Powder (250g)', stock: 50, price: 90, reorderLevel: 12, status: 'Good' }
                ];
                break;
            case 'Pharmacy':
                starterProducts = [
                    { name: 'Paracetamol 650', stock: 200, price: 15, reorderLevel: 50, status: 'Good' },
                    { name: 'Vitamin C', stock: 100, price: 40, reorderLevel: 20, status: 'Good' },
                    { name: 'N95 Masks', stock: 50, price: 90, reorderLevel: 10, status: 'Good' }
                ];
                break;
            case 'Electronics':
                starterProducts = [
                    { name: 'USB-C Cable', stock: 20, price: 350, reorderLevel: 5, status: 'Good' },
                    { name: 'Screen Guard', stock: 30, price: 150, reorderLevel: 8, status: 'Good' },
                    { name: 'Earphones', stock: 15, price: 500, reorderLevel: 4, status: 'Good' }
                ];
                break;
            case 'Textiles':
                starterProducts = [
                    { name: 'Cotton Shirt', stock: 40, price: 650, reorderLevel: 10, status: 'Good' },
                    { name: 'Denim Jeans', stock: 30, price: 1200, reorderLevel: 8, status: 'Good' }
                ];
                break;
            default:
                starterProducts = [
                    { name: 'General Item 1', stock: 10, price: 100, reorderLevel: 2, status: 'Good' }
                ];
        }

        // Add seed products to DB linked to this userId
        if (starterProducts.length > 0) {
            const productsToInsert = starterProducts.map(p => ({ ...p, userId: savedUser._id }));
            await Product.insertMany(productsToInsert);
        }

        res.json({ msg: 'Registration Successful', user: savedUser });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Validate password with Bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // DYNAMIC CATEGORIZATION LOGIC
        // Calculate turnover for last 3 months
        const incomeStats = await Transaction.aggregate([
            { $match: { userId: user._id, type: 'Income' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalTurnover = incomeStats.length > 0 ? incomeStats[0].total : 0;

        // Classification Criteria
        // Micro: < 50 Lakhs (Demo: < 5 Lakhs)
        // Small: 5L - 5 Cr
        // Medium: > 5 Cr
        let newSize = 'Micro';
        if (totalTurnover > 500000 && totalTurnover <= 5000000) newSize = 'Small';
        else if (totalTurnover > 5000000) newSize = 'Medium';

        // Update User if changed
        if (user.size !== newSize) {
            user.size = newSize;
            await user.save();
        }

        // Return user info
        res.json({
            msg: 'Login successful',
            userId: user._id,
            name: user.name,
            businessName: user.businessName,
            email: user.email,
            businessType: user.businessType,
            type: user.businessType, // Keeping 'type' for backward compatibility if needed
            sector: user.sector,
            location: user.location,
            size: user.size,
            growthGoals: user.growthGoals,
            onboardingComplete: user.onboardingComplete
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/profile/:id
// @desc    Get user profile details
// @access  Private (Simulated via ID in params)
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile/:id
// @desc    Update user profile (Onboarding)
// @access  Private (Simulated via ID in params)
router.put('/profile/:id', async (req, res) => {
    try {
        console.log("PUT Profile Update Request:", req.params.id, req.body);
        const { businessName, businessType, sector, location, size, annualTurnover, goals } = req.body;

        let user = await User.findById(req.params.id);
        if (!user) {
            console.warn("User matching ID not found:", req.params.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        user.businessName = businessName || user.businessName;
        user.businessType = businessType || user.businessType;
        user.sector = sector || user.sector;
        user.location = location || user.location;
        user.size = size || user.size;
        user.annualTurnover = annualTurnover ? Number(annualTurnover) : user.annualTurnover;
        user.growthGoals = goals || user.growthGoals;
        user.onboardingComplete = req.body.onboardingComplete !== undefined ? req.body.onboardingComplete : user.onboardingComplete;

        await user.save();
        console.log("Profile updated successfully for:", user.email);
        res.json({ msg: 'Profile updated successfully', user });
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
