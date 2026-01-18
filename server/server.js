require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}));
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// app.use(limiter); 

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/growth', require('./routes/growth'));
app.use('/api/ledger', require('./routes/ledger'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/automation', require('./routes/automation'));

app.get('/', (req, res) => {
    res.send('MSME Business Intelligence Dashboard API is running');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} at 0.0.0.0`);
});
