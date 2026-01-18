require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const income = await Transaction.find({ type: 'Income' });
        const totalRev = income.reduce((s, t) => s + (t.amount || 0), 0);
        console.log('Total Revenue in DB (Global):', totalRev);

        const style = await Transaction.find({ userId: '696a6e4490a1f2d73e06c56e' });
        const styleRev = style.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);
        console.log('StyleHub Revenue (Direct ID):', styleRev);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
