require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        console.log('--- ALL USERS BY EMAIL ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, ID: ${u._id}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
