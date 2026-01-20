const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.\n");

        const users = await User.find().select('name email businessName');

        console.log(`Found ${users.length} users:\n`);
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.name} (${u.email})`);
            console.log(`   Business: ${u.businessName || 'N/A'}`);
            console.log(`   ID: ${u._id}\n`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkUsers();
