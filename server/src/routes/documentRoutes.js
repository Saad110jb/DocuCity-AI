const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');
const { verifyToken, requireRole } = require('../middleware/auth');
const { handleFileUpload } = require('../controllers/uploadController');
const {
  getIngestionDocuments,
  uploadAndCategorizeDocument,
  resolvePolicyConflict,
  toggleStagingStatus,
  deleteIngestionDocument
} = require('../controllers/ingestionController');
const {
  getOcrDocumentDetails,
  saveOcrCorrections,
  normalizeUrduNastaliq
} = require('../controllers/ocrController');
const {
  generateZoningCertificate,
  exportComplianceAuditTrail
} = require('../controllers/exportController');
const { handleBilingualRagQuery } = require('../controllers/ragController');

// Upload
router.post('/upload', upload.single('file'), handleFileUpload);

// Conversational Policy Search (Bilingual RAG Assistant with Isolated Namespace & PII Redaction)
router.post('/rag/chat', verifyToken, handleBilingualRagQuery);

// Municipal Officer Ingestion & Smart Staging Endpoints (Protected by Read-Only Rules)
router.get('/ingestion/list', getIngestionDocuments);
router.post('/ingestion/upload', verifyToken, requireRole(['officer', 'admin', 'superadmin'], 'ingest unverified documents into the system'), upload.single('file'), uploadAndCategorizeDocument);
router.put('/ingestion/conflict/:documentId', verifyToken, requireRole(['officer', 'admin', 'superadmin'], 'alter policy rules or resolve conflicts'), resolvePolicyConflict);
router.put('/ingestion/staging/:documentId', verifyToken, requireRole(['officer', 'admin', 'superadmin'], 'alter staging status or policy rules'), toggleStagingStatus);
router.delete('/ingestion/:documentId', verifyToken, requireRole(['officer', 'admin', 'superadmin'], 'delete municipal records'), deleteIngestionDocument);

// OCR & Bilingual Entity Correction Studio Endpoints
router.get('/ocr/:documentId', getOcrDocumentDetails);
router.post('/ocr/save', verifyToken, requireRole(['officer', 'admin', 'superadmin'], 'modify OCR entity ground truth'), saveOcrCorrections);
router.post('/ocr/normalize-urdu', normalizeUrduNastaliq);

// Official Communication & Export Tools Endpoints
router.post('/export/zoning-certificate', generateZoningCertificate);
router.get('/export/audit-trail', exportComplianceAuditTrail);

module.exports = router;
