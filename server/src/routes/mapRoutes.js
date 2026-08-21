const express = require('express');
const router = express.Router();
const { proxyRagQuery, proxyGetZones } = require('../controllers/proxyController');

router.get('/zones', proxyGetZones);
router.post('/query', proxyRagQuery);

module.exports = router;
