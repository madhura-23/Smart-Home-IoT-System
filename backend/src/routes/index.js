const express = require('express');
const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const roomRoutes = require('./roomRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;
