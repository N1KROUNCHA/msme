require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const uniqueEmail = `test_${Date.now()}@msme.com`;
        const user = await User.create({
            name: 'Test Atlas',
            email: uniqueEmail,
            password: 'password123',
            businessName: 'Atlas Verification'
        });
        console.log('Created User in Atlas:', user.email);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
