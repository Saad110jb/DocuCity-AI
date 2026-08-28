import React from 'react';
import { GeoJSON } from 'react-leaflet';

// ── Zone Type → Color Map (matches the 5-category legend) ──────────────────
const ZONE_TYPE_COLORS = {
  Commercial:  { fill: '#EF4444', stroke: '#B91C1C' },   // 🔴 Red / Coral
  Residential: { fill: '#EAB308', stroke: '#A16207' },   // 🟡 Gold / Yellow
  Industrial:  { fill: '#A855F7', stroke: '#7E22CE' },   // 🟣 Purple
  Agricultural:{ fill: '#10B981', stroke: '#047857' },   // 🟢 Emerald Green
  Heritage:    { fill: '#06B6D4', stroke: '#0E7490' },   // 🔵 Cyan / Blue
  Utility:     { fill: '#06B6D4', stroke: '#0E7490' },
  'Master Plan':{ fill: '#38BDF8', stroke: '#0284C7' },
};

const DEFAULT_COLOR = { fill: '#3B82F6', stroke: '#1D4ED8' };

export function GeoJsonLayer({ geoJsonData, onSelectZone }) {
  if (!geoJsonData) return null;

  const getColors = (feature) => {
    const zoneType = feature.properties?.zone_type;
    return ZONE_TYPE_COLORS[zoneType] || { fill: feature.properties?.color || DEFAULT_COLOR.fill, stroke: DEFAULT_COLOR.stroke };
  };

  const styleFeature = (feature) => {
    const { fill, stroke } = getColors(feature);
    return {
      fillColor: fill,
      weight: 2,
      opacity: 1,
      color: stroke,
      dashArray: '4 3',
      fillOpacity: 0.35,
    };
  };

  const onEachFeature = (feature, layer) => {
    const { fill, stroke } = getColors(feature);

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          weight: 3,
          fillOpacity: 0.6,
          color: '#ffffff',
          dashArray: '',
        });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(styleFeature(feature));
      },
      click: () => {
        if (onSelectZone && feature.properties) {
          onSelectZone(feature.properties);
        }
      },
    });

    // Lightweight tooltip on hover
    if (feature.properties?.zone_name) {
      layer.bindTooltip(
        `<div style="font-size:11px;font-weight:700;color:#fff;background:#1e293b;padding:4px 8px;border-radius:6px;border:1px solid #334155;">
          ${feature.properties.zone_name}
          ${feature.properties.zone_type ? `<br/><span style="color:#94a3b8;font-size:10px;">${feature.properties.zone_type}</span>` : ''}
        </div>`,
        { permanent: false, direction: 'top', opacity: 0.97 }
      );
    }
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
