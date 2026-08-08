const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController');

router.post('/connect', dbController.connectDB);
router.post('/disconnect', dbController.disconnectDB);
router.get('/db-name', dbController.getDbName);
router.get('/tables', dbController.getTables);
router.get('/columns/:table', dbController.getColumns);
router.post('/query', dbController.executeQuery);

module.exports = router;