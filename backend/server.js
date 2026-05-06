console.log('>>> [SignalSplit] Booting Server...');

let express, mongoose, cors, authRoutes, analyticsRoutes, path;

try {
    console.log('>>> [SignalSplit] Loading libraries...');
    express = require('express');
    mongoose = require('mongoose');
    cors = require('cors');
    path = require('path');
    
    console.log('>>> [SignalSplit] Loading routes...');
    authRoutes = require('./routes/auth');
    analyticsRoutes = require('./routes/analytics');
} catch (error) {
    console.error('!!! FATAL LOADING ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Validate essential environment variables
console.log('Detected Environment Variables:', Object.keys(process.env).filter(k => k.includes('URI') || k.includes('SECRET') || k.includes('KEY')));
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: ${env} is not defined in environment variables.`);
        process.exit(1);
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../frontend/dist');
    console.log('Production mode detected. Serving frontend from:', distPath);
    app.use(express.static(distPath));
    app.get('(.*)', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('SignalSplit API is running...');
    });
}

// Database connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✓ Connected to MongoDB');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✓ Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('✗ MongoDB connection error:', err);
        process.exit(1); // Exit if DB connection fails in production
    });
