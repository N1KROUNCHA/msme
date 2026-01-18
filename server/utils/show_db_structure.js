require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to Database:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n--- Collections & Counts ---');

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection: '${col.name}' | Documents: ${count}`);
        }

        console.log('----------------------------');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
