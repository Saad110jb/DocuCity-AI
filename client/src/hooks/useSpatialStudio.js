import { useState } from 'react';
import axios from 'axios';

export const useSpatialStudio = () => {
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  // Auto-resolve place name from OCR to Polygon
  const resolveLocationToPolygon = async (locationText) => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/map/spatial/resolve', { query: locationText });
      return data.geojson;
    } catch (err) {
      console.error('Failed to resolve polygon:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate linear road corridor buffer
  const generateRoadCorridor = async (roadName, bufferMeters = 30.0) => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/map/spatial/corridor', {
        road_name: roadName,
        buffer_meters: bufferMeters
      });
      return data.corridor_polygon;
    } catch (err) {
      console.error('Failed to generate road corridor:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Run topological conflict check whenever vertices change
  const checkConflicts = async (department, geometry) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/map/spatial/detect-conflicts', {
        department,
        proposed_geometry: geometry,
        category: 'Zoning Modification'
      });
      setConflicts(data.conflicts || []);
      return data;
    } catch (err) {
      console.error('Conflict detection error:', err);
      return null;
    }
  };

  // Fetch Multi-Department GeoJSON layers (LDA, WASA, MCL)
  const fetchDepartmentLayers = async (department) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/map/spatial/layers?department=${department || 'All'}`);
      return data.layers || [];
    } catch (err) {
      console.error('Failed to fetch spatial layers:', err);
      return [];
    }
  };

  // Save modified layer vertices
  const saveLayerGeometry = async (layerId, geometry) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/map/spatial/layers/${layerId}`, {
        layer_id: layerId,
        geometry
      });
      return data;
    } catch (err) {
      console.error('Failed to save layer geometry:', err);
      return null;
    }
  };

  return {
    resolveLocationToPolygon,
    generateRoadCorridor,
    checkConflicts,
    fetchDepartmentLayers,
    saveLayerGeometry,
    conflicts,
    loading
  };
};
