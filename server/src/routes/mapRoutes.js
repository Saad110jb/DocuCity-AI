const express = require('express');
const router = express.Router();
const {
  resolveSpatialLocation,
  generateRoadCorridor,
  detectSpatialConflicts,
  getMultiDepartmentLayers,
  updateLayerGeometry
} = require('../controllers/spatialController');
const { handleBilingualRagQuery } = require('../controllers/ragController');

// Map layers & zones queries
router.get('/layers', getMultiDepartmentLayers);
router.get('/zones', getMultiDepartmentLayers);
router.get('/spatial/layers', getMultiDepartmentLayers);

// RAG QA & Policy Bylaws Queries
router.post('/query', handleBilingualRagQuery);
router.post('/query-bylaws', handleBilingualRagQuery);

// Spatial Policy & GIS Mapping Studio API Contracts
router.post('/spatial/resolve', resolveSpatialLocation);
router.post('/spatial/corridor', generateRoadCorridor);
router.post('/spatial/detect-conflicts', detectSpatialConflicts);
router.put('/spatial/layers/:id', updateLayerGeometry);

module.exports = router;
