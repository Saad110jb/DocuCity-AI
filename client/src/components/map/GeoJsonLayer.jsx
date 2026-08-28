import React from 'react';
import { GeoJSON } from 'react-leaflet';

// ── Zone Type → Color Map (distinct, vibrant palette matching legend) ───────
const ZONE_TYPE_COLORS = {
  Commercial:   { fill: '#EF4444', stroke: '#DC2626' },   // 🔴 Red / Coral
  Residential:  { fill: '#F59E0B', stroke: '#D97706' },   // 🟡 Gold / Amber
  Industrial:   { fill: '#A855F7', stroke: '#7E22CE' },   // 🟣 Violet / Purple
  Agricultural: { fill: '#10B981', stroke: '#047857' },   // 🟢 Emerald Green
  Heritage:     { fill: '#06B6D4', stroke: '#0891B2' },   // 🔵 Cyan / Blue
  Utility:      { fill: '#06B6D4', stroke: '#0891B2' },
  'Master Plan':{ fill: 'transparent', stroke: '#38BDF8' }, // Non-intrusive boundary line
};

const DEFAULT_COLOR = { fill: '#3B82F6', stroke: '#1D4ED8' };

export function GeoJsonLayer({ geoJsonData, selectedZone, onSelectZone }) {
  if (!geoJsonData || !geoJsonData.features) return null;

  // Filter and sort features so specific zone polygons render ON TOP and master plan boundary doesn't cover them
  const sortedFeatures = [...geoJsonData.features].sort((a, b) => {
    const isMasterA = a.properties?.zone_type === 'Master Plan' || a.properties?.layerId === 'layer-masterplan-2050';
    const isMasterB = b.properties?.zone_type === 'Master Plan' || b.properties?.layerId === 'layer-masterplan-2050';
    if (isMasterA && !isMasterB) return -1; // Master plan goes to bottom
    if (!isMasterA && isMasterB) return 1;
    return 0;
  });

  const getColors = (feature) => {
    const zoneType = feature.properties?.zone_type;
    return ZONE_TYPE_COLORS[zoneType] || { fill: feature.properties?.color || DEFAULT_COLOR.fill, stroke: DEFAULT_COLOR.stroke };
  };

  const styleFeature = (feature) => {
    const isMasterPlan = feature.properties?.zone_type === 'Master Plan' || feature.properties?.layerId === 'layer-masterplan-2050';
    
    // Master plan city boundary should be a clean outer dashed line, NOT a solid blue shade covering the city
    if (isMasterPlan) {
      return {
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: 2,
        opacity: 0.8,
        color: '#0284C7',
        dashArray: '10 6',
        interactive: false // Do not block mouse clicks on specific zones
      };
    }

    const { fill, stroke } = getColors(feature);
    const isSelected = selectedZone && (
      (selectedZone.zone_code && selectedZone.zone_code === feature.properties?.zone_code) ||
      (selectedZone.layerId && selectedZone.layerId === feature.properties?.layerId) ||
      (selectedZone.zone_name && selectedZone.zone_name === feature.properties?.zone_name)
    );

    if (isSelected) {
      return {
        fillColor: fill,
        weight: 4.5,
        opacity: 1,
        color: '#FFFFFF',
        dashArray: '',
        fillOpacity: 0.75,
      };
    }

    return {
      fillColor: fill,
      weight: 2.5,
      opacity: 0.95,
      color: stroke,
      dashArray: '4 3',
      fillOpacity: 0.45,
    };
  };

  const onEachFeature = (feature, layer) => {
    const isMasterPlan = feature.properties?.zone_type === 'Master Plan' || feature.properties?.layerId === 'layer-masterplan-2050';
    
    if (isMasterPlan) {
      return; // Do not attach hover/click listeners to the city-wide outer boundary
    }

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          weight: 4,
          fillOpacity: 0.7,
          color: '#ffffff',
          dashArray: '',
        });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(styleFeature(feature));
      },
      click: (e) => {
        if (e.originalEvent) {
          e.originalEvent._polygonClicked = true;
        }
        if (onSelectZone && feature.properties) {
          onSelectZone(feature.properties, e.latlng);
        }
      },
    });

    // Tooltip on hover
    if (feature.properties?.zone_name) {
      layer.bindTooltip(
        `<div style="font-size:11px;font-weight:700;color:#fff;background:#0f172a;padding:5px 9px;border-radius:8px;border:1px solid #334155;box-shadow:0 4px 14px rgba(0,0,0,0.6);">
          <div style="font-size:12px;font-weight:bold;">${feature.properties.zone_name}</div>
          <div style="color:#38bdf8;font-size:10px;margin-top:2px;">
            ${feature.properties.authority ? feature.properties.authority + ' · ' : ''}${feature.properties.zone_type || 'Zone'}
          </div>
          ${feature.properties.far ? `<div style="color:#4ade80;font-size:10px;margin-top:1px;">FAR: ${feature.properties.far} · Max Height: ${feature.properties.max_height_ft ? feature.properties.max_height_ft + 'ft' : '38ft'}</div>` : ''}
        </div>`,
        { permanent: false, direction: 'top', opacity: 0.98 }
      );
    }
  };

  return (
    <GeoJSON
      key={JSON.stringify(sortedFeatures.map(f => f.properties?.layerId || f.properties?.zone_code)) + '-' + (selectedZone?.zone_code || '')}
      data={{ type: 'FeatureCollection', features: sortedFeatures }}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}
