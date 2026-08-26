const express = require('express');
const router = express.Router();
const { getSecurityConfig, updateSecurityConfig, testRedactionEngine } = require('../controllers/securityController');
const { getAuditAndMonitoring, resolveErrorLog } = require('../controllers/auditController');
const { getPlatformConfig, updatePlatformConfig, triggerSystemAction } = require('../controllers/platformController');
const {
  getAnalyticsOverview,
  resolveSearchGap,
  resolveCitationDispute
} = require('../controllers/analyticsController');

// Security & PII Rules
router.get('/config', getSecurityConfig);
router.post('/pii-rules', updateSecurityConfig);
router.post('/test-redaction', testRedactionEngine);

// System Monitoring & Audit Logs
router.get('/audit-logs', getAuditAndMonitoring);
router.put('/pipeline-errors/:errorId', resolveErrorLog);

// Global Platform Settings
router.get('/platform-config', getPlatformConfig);
router.post('/platform-settings', updatePlatformConfig);
router.post('/trigger-action', triggerSystemAction);

// Policy Analytics & Public Query Insights
router.get('/analytics', getAnalyticsOverview);
router.put('/analytics/gaps/:gapId', resolveSearchGap);
router.put('/analytics/disputes/:disputeId', resolveCitationDispute);

module.exports = router;
