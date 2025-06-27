const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const articleRoutes = require('./article.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);

module.exports = router; 