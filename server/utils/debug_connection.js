require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('--- CONNECTION DEBUG ---');
        console.log('Connected to Host:', mongoose.connection.host);
        console.log('Target Database:', mongoose.connection.name);

        console.log('\n--- COLLECTIONS ---');
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.length === 0) {
            console.log('(No collections found)');
        } else {
            collections.forEach(c => console.log(`- ${c.name}`));
        }

        console.log('\n--- DATA CHECK ---');
        const User = mongoose.model('User', new mongoose.Schema({}), 'users');
        const userCount = await User.countDocuments();
        console.log(`User Documents: ${userCount}`);

        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Failed:', err);
        process.exit(1);
    });
