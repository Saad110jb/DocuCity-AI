import { useState, useEffect } from 'react';
import { fetchZonesGeoJson } from '../services/api';

export function useMapLayers() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLayers() {
      try {
        setLoading(true);
        const data = await fetchZonesGeoJson();
        setGeoJsonData(data);
      } catch (err) {
        console.error('Error fetching Lahore map layers:', err);
        setError('Could not load GIS zoning layers.');
      } finally {
        setLoading(false);
      }
    }

    loadLayers();
  }, []);

  return {
    geoJsonData,
    loading,
    error,
    selectedZone,
    setSelectedZone
  };
}
