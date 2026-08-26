const express = require('express');
const router = express.Router();
const {
  resolveSpatialLocation,
  generateRoadCorridor,
  detectSpatialConflicts,
  getMultiDepartmentLayers,
  updateLayerGeometry
} = require('../controllers/spatialController');

// Map layers & bylaws queries
router.get('/layers', getMultiDepartmentLayers);
router.post('/query-bylaws', resolveSpatialLocation);

// Spatial Policy & GIS Mapping Studio API Contracts
router.post('/spatial/resolve', resolveSpatialLocation);
router.post('/spatial/corridor', generateRoadCorridor);
router.post('/spatial/detect-conflicts', detectSpatialConflicts);
router.get('/spatial/layers', getMultiDepartmentLayers);
router.put('/spatial/layers/:id', updateLayerGeometry);

module.exports = router;
