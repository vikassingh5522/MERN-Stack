const express = require('express');
const router = express.Router();
const initializeController = require('../controllers/initializeController');

router.get('/initialize', initializeController.initializeDatabase);

module.exports = router;
