const express = require('express');
const router = express.Router();
const { getSecurityConfig, updateSecurityConfig, testRedactionEngine } = require('../controllers/securityController');
const { getAuditAndMonitoring, resolveErrorLog } = require('../controllers/auditController');
const { getPlatformConfig, updatePlatformConfig, triggerSystemAction } = require('../controllers/platformController');

// Security & Namespace routes (Open for Admin Dashboard queries)
router.get('/config', getSecurityConfig);
router.post('/config', updateSecurityConfig);
router.post('/redact-test', testRedactionEngine);

// System Monitoring & Audit routes
router.get('/audit-monitoring', getAuditAndMonitoring);
router.put('/audit-monitoring/errors/:id/resolve', resolveErrorLog);

// Global Platform Control routes
router.get('/platform-config', getPlatformConfig);
router.post('/platform-config', updatePlatformConfig);
router.post('/system-action', triggerSystemAction);

module.exports = router;
