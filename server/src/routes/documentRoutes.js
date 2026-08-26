const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');
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

// Upload
router.post('/upload', upload.single('file'), handleFileUpload);

// Municipal Officer Ingestion & Smart Staging Endpoints
router.get('/ingestion/list', getIngestionDocuments);
router.post('/ingestion/upload', upload.single('file'), uploadAndCategorizeDocument);
router.put('/ingestion/conflict/:documentId', resolvePolicyConflict);
router.put('/ingestion/staging/:documentId', toggleStagingStatus);
router.delete('/ingestion/:documentId', deleteIngestionDocument);

// OCR & Bilingual Entity Correction Studio Endpoints
router.get('/ocr/:documentId', getOcrDocumentDetails);
router.post('/ocr/save', saveOcrCorrections);
router.post('/ocr/normalize-urdu', normalizeUrduNastaliq);

// Official Communication & Export Tools Endpoints
router.post('/export/zoning-certificate', generateZoningCertificate);
router.get('/export/audit-trail', exportComplianceAuditTrail);

module.exports = router;
