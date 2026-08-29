const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getSecurityConfig,
  updateSecurityConfig,
  testRedactionEngine,
  testAccessBoundaries
} = require('../controllers/securityController');
const { getAuditAndMonitoring, resolveErrorLog } = require('../controllers/auditController');
const { getPlatformConfig, updatePlatformConfig, triggerSystemAction } = require('../controllers/platformController');
const {
  getAnalyticsOverview,
  resolveSearchGap,
  resolveCitationDispute
} = require('../controllers/analyticsController');

// Security & PII Rules
router.get('/config', getSecurityConfig);
router.post('/config', verifyToken, requireRole(['admin', 'superadmin'], 'alter global security rules'), updateSecurityConfig);
router.post('/pii-rules', verifyToken, requireRole(['admin', 'superadmin'], 'alter PII redaction rules'), updateSecurityConfig);
router.post('/test-redaction', testRedactionEngine);
router.post('/redact-test', testRedactionEngine);
router.post('/test-boundaries', testAccessBoundaries);

// System Monitoring & Audit Logs
router.get('/audit-logs', getAuditAndMonitoring);
router.put('/pipeline-errors/:errorId', verifyToken, requireRole(['admin', 'superadmin', 'officer'], 'resolve pipeline errors'), resolveErrorLog);

// Global Platform Settings
router.get('/platform-config', getPlatformConfig);
router.post('/platform-settings', verifyToken, requireRole(['admin', 'superadmin'], 'alter platform settings'), updatePlatformConfig);
router.post('/trigger-action', verifyToken, requireRole(['admin', 'superadmin'], 'trigger administrative system actions'), triggerSystemAction);

// Policy Analytics & Public Query Insights
router.get('/analytics', getAnalyticsOverview);
router.put('/analytics/gaps/:gapId', verifyToken, requireRole(['admin', 'superadmin', 'officer'], 'resolve search gaps'), resolveSearchGap);
router.put('/analytics/disputes/:disputeId', verifyToken, requireRole(['admin', 'superadmin', 'officer'], 'resolve citation disputes'), resolveCitationDispute);

module.exports = router;
