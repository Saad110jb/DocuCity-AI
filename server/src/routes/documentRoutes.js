const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleFileUpload } = require('../controllers/uploadController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getAuditLogs } = require('../models/DocumentAudit');

const upload = multer({ storage: multer.memoryStorage() });

// Document upload route (Municipal Officer / Admin)
router.post('/upload', verifyToken, requireRole(['officer', 'admin']), upload.single('file'), handleFileUpload);

// Audit trail logs route (Officer / Admin)
router.get('/audit-logs', verifyToken, requireRole(['officer', 'admin']), async (req, res) => {
  const logs = await getAuditLogs();
  res.json({ logs });
});

module.exports = router;
