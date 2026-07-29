const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController');

// Route: GET /api/tables
router.get('/tables', dbController.getTables);

// Route: POST /api/query
router.post('/query', dbController.executeQuery);

module.exports = router;