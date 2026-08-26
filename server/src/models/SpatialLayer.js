const mongoose = require('mongoose');

const spatialLayerSchema = new mongoose.Schema({
  layerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, enum: ['LDA', 'WASA', 'MCL', 'Urban Unit', 'DHA Lahore', 'Walled City Authority'], default: 'LDA' },
  color: { type: String, default: '#3B82F6' },
  geojson: {
    type: { type: String, default: 'Feature' },
    geometry: {
      type: { type: String, default: 'Polygon' },
      coordinates: { type: Array, required: true }
    },
    properties: { type: Object, default: {} }
  },
  updatedAt: { type: Date, default: Date.now }
});

let SpatialLayer;
try {
  SpatialLayer = mongoose.model('SpatialLayer', spatialLayerSchema);
} catch (e) {
  SpatialLayer = mongoose.model('SpatialLayer');
}

const initialSpatialLayers = [
  // --- LDA ZONES ---
  {
    layerId: "layer-lda-gulberg",
    name: "Gulberg Commercial High-Density Zone (Main Blvd & M.M. Alam)",
    department: "LDA",
    color: "#3B82F6",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.345, 31.515], [74.365, 31.515], [74.365, 31.535], [74.345, 31.535], [74.345, 31.515]]] },
      properties: { zone: "Gulberg Commercial Zone", far: "1:8", max_height: "120ft", fee_tier: "Tier 1" }
    }
  },
  {
    layerId: "layer-lda-johartown",
    name: "Johar Town Phase 1 & 2 Commercial & Residential Scheme",
    department: "LDA",
    color: "#10B981",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.270, 31.460], [74.300, 31.460], [74.300, 31.485], [74.270, 31.485], [74.270, 31.460]]] },
      properties: { zone: "Johar Town Phase 1 & 2", far: "1:4", max_height: "45ft", fee_tier: "Tier 2" }
    }
  },
  {
    layerId: "layer-lda-modeltown",
    name: "Model Town & Extension Residential Conservation Zone",
    department: "LDA",
    color: "#8B5CF6",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.320, 31.470], [74.345, 31.470], [74.345, 31.495], [74.320, 31.495], [74.320, 31.470]]] },
      properties: { zone: "Model Town", far: "1:3.5", max_height: "38ft", fee_tier: "Standard" }
    }
  },
  {
    layerId: "layer-lda-iqbaltown",
    name: "Allama Iqbal Town Moon Market Commercial Corridor",
    department: "LDA",
    color: "#F59E0B",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.280, 31.500], [74.305, 31.500], [74.305, 31.525], [74.280, 31.525], [74.280, 31.500]]] },
      properties: { zone: "Allama Iqbal Town", far: "1:5", max_height: "60ft" }
    }
  },
  {
    layerId: "layer-lda-sabzazar",
    name: "Sabzazar Housing Scheme & Multan Road Corridor",
    department: "LDA",
    color: "#EC4899",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.250, 31.490], [74.275, 31.490], [74.275, 31.515], [74.250, 31.515], [74.250, 31.490]]] },
      properties: { zone: "Sabzazar Scheme", far: "1:4" }
    }
  },
  {
    layerId: "layer-lda-avenue1",
    name: "LDA Avenue-1 & LDA City Master Development Boundary",
    department: "LDA",
    color: "#6366F1",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.220, 31.380], [74.260, 31.380], [74.260, 31.420], [74.220, 31.420], [74.220, 31.380]]] },
      properties: { zone: "LDA City Scheme", master_plan: "2050" }
    }
  },

  // --- DHA LAHORE ZONES ---
  {
    layerId: "layer-dha-phases",
    name: "DHA Lahore Phases 1-9 & Raya Commercial Center Zone",
    department: "DHA Lahore",
    color: "#14B8A6",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.375, 31.450], [74.450, 31.450], [74.450, 31.500], [74.375, 31.500], [74.375, 31.450]]] },
      properties: { zone: "DHA Lahore All Phases", authority: "DHA" }
    }
  },

  // --- WASA UTILITY LINES ---
  {
    layerId: "layer-wasa-johar-trunk",
    name: "WASA Johar Town Trunk Sewerage Protection Buffer Line",
    department: "WASA",
    color: "#06B6D4",
    geojson: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[74.275, 31.465], [74.295, 31.480], [74.310, 31.490]] },
      properties: { utility: "Trunk Sewerage Line", buffer: "15m", authority: "WASA" }
    }
  },
  {
    layerId: "layer-wasa-ravi-water",
    name: "WASA Water Treatment & Intake Buffer Protection Zone (Ravi)",
    department: "WASA",
    color: "#0284C7",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.300, 31.590], [74.330, 31.590], [74.330, 31.620], [74.300, 31.620], [74.300, 31.590]]] },
      properties: { zone: "Ravi Intake Protection", restriction: "No Hazardous Waste" }
    }
  },

  // --- MCL ADMINISTRATIVE MARKET ZONES ---
  {
    layerId: "layer-mcl-anarkali",
    name: "MCL Anarkali & Shah Alami Market Commercial Control Zone",
    department: "MCL",
    color: "#A855F7",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.310, 31.565], [74.330, 31.565], [74.330, 31.580], [74.310, 31.580], [74.310, 31.565]]] },
      properties: { zone: "MCL Anarkali Commercial", fee_tier: "Tier 1" }
    }
  },
  {
    layerId: "layer-mcl-ferozepur",
    name: "MCL Ferozepur Road Commercial Spine Alignment (Ichhra to Shama)",
    department: "MCL",
    color: "#D97706",
    geojson: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[74.320, 31.520], [74.335, 31.490], [74.345, 31.460]] },
      properties: { corridor: "Ferozepur Road Spine", buffer: "30m" }
    }
  },

  // --- WALLED CITY & HERITAGE CONSERVATION ZONES ---
  {
    layerId: "layer-wcca-walledcity",
    name: "Walled City of Lahore (Shahi Qila & Delhi Gate Heritage Buffer)",
    department: "Walled City Authority",
    color: "#E11D48",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.310, 31.580], [74.328, 31.580], [74.328, 31.595], [74.310, 31.595], [74.310, 31.580]]] },
      properties: { zone: "Walled City Heritage Buffer", max_height: "30ft", protection: "Strict Historical" }
    }
  },
  {
    layerId: "layer-wcca-mallroad",
    name: "Mall Road Special Heritage Conservation Corridor",
    department: "Walled City Authority",
    color: "#BE185D",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.310, 31.555], [74.335, 31.555], [74.335, 31.565], [74.310, 31.565], [74.310, 31.555]]] },
      properties: { zone: "Mall Road Corridor", max_height: "30ft" }
    }
  },

  // --- PERI-URBAN & MASTER PLAN 2050 ---
  {
    layerId: "layer-sundar-industrial",
    name: "Sundar Industrial Estate & Multan Road Industrial Belt",
    department: "Urban Unit",
    color: "#475569",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.150, 31.280], [74.200, 31.280], [74.200, 31.330], [74.150, 31.330], [74.150, 31.280]]] },
      properties: { zone: "Sundar Industrial Belt", category: "Industrial High-Load" }
    }
  },
  {
    layerId: "layer-masterplan-2050",
    name: "All Lahore Metropolitan District Master Plan 2050 Boundary",
    department: "Urban Unit",
    color: "#38BDF8",
    geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[74.100, 31.200], [74.500, 31.200], [74.500, 31.650], [74.100, 31.650], [74.100, 31.200]]] },
      properties: { zone: "All Lahore District", scope: "City-Wide 2050" }
    }
  }
];

async function seedInitialSpatialLayers() {
  if (mongoose.connection.readyState === 1) {
    try {
      await SpatialLayer.deleteMany({});
      await SpatialLayer.insertMany(initialSpatialLayers);
      console.log('[SpatialLayer] Seeded 15 All-Lahore GIS spatial layers into MongoDB spatiallayers collection.');
    } catch (e) {
      console.warn('[SpatialLayer] Seed warning:', e.message);
    }
  }
}

module.exports = { SpatialLayer, seedInitialSpatialLayers, initialSpatialLayers };
