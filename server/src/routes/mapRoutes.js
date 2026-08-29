const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  resolveSpatialLocation,
  generateRoadCorridor,
  detectSpatialConflicts,
  getMultiDepartmentLayers,
  updateLayerGeometry
} = require('../controllers/spatialController');
const { handleBilingualRagQuery } = require('../controllers/ragController');

// Map layers & zones queries (Public Citizen Read-Only accessible)
router.get('/layers', getMultiDepartmentLayers);
router.get('/zones', getMultiDepartmentLayers);
router.get('/spatial/layers', getMultiDepartmentLayers);

// RAG QA & Policy Bylaws Queries (Public Citizen Safe & PII Redacted)
router.post('/query', verifyToken, handleBilingualRagQuery);
router.post('/query-bylaws', verifyToken, handleBilingualRagQuery);

// Spatial Policy & GIS Mapping Studio API Contracts
router.post('/spatial/resolve', resolveSpatialLocation);
router.post('/spatial/corridor', generateRoadCorridor);
router.post('/spatial/detect-conflicts', detectSpatialConflicts);

// Read-Only Permissions Enforcement: Public users cannot modify zoning geometries
router.put('/spatial/layers/:id', verifyToken, requireRole(['officer', 'admin', 'superadmin'], 'modify zoning geometries'), updateLayerGeometry);

module.exports = router;
