const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
router.use('/auth', authRoutes);

module.exports = router;
