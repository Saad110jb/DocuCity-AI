import React from 'react';
import { GeoJSON } from 'react-leaflet';

export function GeoJsonLayer({ geoJsonData, onSelectZone }) {
  if (!geoJsonData) return null;

  const styleFeature = (feature) => {
    const color = feature.properties?.color || '#10B981';
    return {
      fillColor: color,
      weight: 2,
      opacity: 0.9,
      color: color,
      dashArray: '3',
      fillOpacity: 0.35
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 4,
          fillOpacity: 0.6,
          color: '#ffffff'
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(styleFeature(feature));
      },
      click: () => {
        if (onSelectZone && feature.properties) {
          onSelectZone(feature.properties);
        }
      }
    });
  };

  return (
    <GeoJSON
      key={JSON.stringify(geoJsonData)}
      data={geoJsonData}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}
