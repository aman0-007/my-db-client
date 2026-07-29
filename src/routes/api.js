const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController');

// Route: GET /api/db-name
router.get('/db-name', dbController.getDbName);

// Route: GET /api/tables
router.get('/tables', dbController.getTables);

// Route: GET /api/columns/:table
router.get('/columns/:table', dbController.getColumns);

// Route: POST /api/query
router.post('/query', dbController.executeQuery);

module.exports = router;