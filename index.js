require('dotenv').config();
const fs = require('fs'); // You can remove this if not using HTTPS anymore
const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

require('./db/db.js');
// require('./controllers/backend/cronJobs.js');

// Create an Express application
const app = express();

// ✅ Trust proxy to get real client IP when behind reverse proxy
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/backend', adminRoutes);
app.use('/api', authRoutes);

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});