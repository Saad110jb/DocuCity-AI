const mongoose = require('mongoose');

const spatialLayerSchema = new mongoose.Schema({
  layerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: {
    type: String,
    enum: ['LDA', 'WASA', 'MCL', 'Urban Unit', 'DHA Lahore', 'Walled City Authority'],
    default: 'LDA'
  },
  zone_type: {
    type: String,
    enum: ['Commercial', 'Residential', 'Industrial', 'Agricultural', 'Heritage', 'Utility', 'Master Plan'],
    default: 'Residential'
  },
  color: { type: String, default: '#3B82F6' },

  // Policy & Bylaw Fields
  authority: { type: String, default: 'LDA' },
  far: { type: String, default: '' },
  max_height_ft: { type: Number, default: null },
  setback_front_ft: { type: Number, default: null },
  setback_side_ft: { type: Number, default: null },
  commercialization_status: {
    type: String,
    enum: ['Permanent (List A)', 'Temporary Renewal', 'None', ''],
    default: 'None'
  },
  dc_rate_percent: { type: Number, default: null },
  gazette_reference: { type: String, default: '' },
  permitted_uses: { type: [String], default: [] },

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

  // ─────────── LDA ZONES ───────────

  {
    layerId: 'layer-lda-gulberg',
    name: 'Gulberg III Commercial High-Density Zone (Main Blvd & M.M. Alam)',
    department: 'LDA',
    zone_type: 'Commercial',
    color: '#EF4444',
    authority: 'LDA',
    far: '1:8',
    max_height_ft: 120,
    setback_front_ft: 20,
    setback_side_ft: 10,
    commercialization_status: 'Permanent (List A)',
    dc_rate_percent: 20,
    gazette_reference: 'LDA Gazette Notification No. 14/2023-C',
    permitted_uses: ['High-Rise Commercial', 'Office Towers', 'Retail Plazas', 'Hotels', 'Mixed-Use'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.345, 31.515], [74.365, 31.515], [74.365, 31.535], [74.345, 31.535], [74.345, 31.515]]]
      },
      properties: {
        zone_name: 'Gulberg III Commercial Area',
        zone_code: 'LDA-C-GB3',
        zone_type: 'Commercial',
        authority: 'LDA',
        far: '1:8',
        max_height_ft: 120,
        setback_front_ft: 20,
        setback_side_ft: 10,
        commercialization_status: 'Permanent (List A)',
        dc_rate_percent: 20,
        gazette_reference: 'LDA Gazette No. 14/2023-C',
        permitted_uses: ['High-Rise Commercial', 'Office Towers', 'Retail Plazas', 'Hotels', 'Mixed-Use'],
        category: 'Commercial High-Density',
        color: '#EF4444'
      }
    }
  },

  {
    layerId: 'layer-lda-johartown',
    name: 'Johar Town Phase 1 & 2 Commercial & Residential Scheme',
    department: 'LDA',
    zone_type: 'Residential',
    color: '#EAB308',
    authority: 'LDA',
    far: '1:4',
    max_height_ft: 38,
    setback_front_ft: 10,
    setback_side_ft: 5,
    commercialization_status: 'Temporary Renewal',
    dc_rate_percent: 10,
    gazette_reference: 'LDA Gazette No. 08/2021-R',
    permitted_uses: ['G+2 Residential', 'Community Facilities', 'Neighbourhood Shops', 'Mosques'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.270, 31.460], [74.300, 31.460], [74.300, 31.485], [74.270, 31.485], [74.270, 31.460]]]
      },
      properties: {
        zone_name: 'Johar Town Block H & Phase 2',
        zone_code: 'LDA-R-JT2',
        zone_type: 'Residential',
        authority: 'LDA',
        far: '1:4',
        max_height_ft: 38,
        setback_front_ft: 10,
        setback_side_ft: 5,
        commercialization_status: 'Temporary Renewal',
        dc_rate_percent: 10,
        gazette_reference: 'LDA Gazette No. 08/2021-R',
        permitted_uses: ['G+2 Residential', 'Community Facilities', 'Neighbourhood Shops', 'Mosques'],
        category: 'Residential Medium-Density',
        color: '#EAB308'
      }
    }
  },

  {
    layerId: 'layer-lda-modeltown',
    name: 'Model Town & Extension Residential Conservation Zone',
    department: 'LDA',
    zone_type: 'Residential',
    color: '#EAB308',
    authority: 'LDA',
    far: '1:3.5',
    max_height_ft: 38,
    setback_front_ft: 15,
    setback_side_ft: 7,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'LDA Bylaw No. MT-R/2019',
    permitted_uses: ['G+2 Residential', 'Parks', 'Schools', 'Clinics'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.320, 31.470], [74.345, 31.470], [74.345, 31.495], [74.320, 31.495], [74.320, 31.470]]]
      },
      properties: {
        zone_name: 'Model Town Extension Residential Zone',
        zone_code: 'LDA-R-MT',
        zone_type: 'Residential',
        authority: 'LDA',
        far: '1:3.5',
        max_height_ft: 38,
        setback_front_ft: 15,
        setback_side_ft: 7,
        commercialization_status: 'None',
        dc_rate_percent: null,
        gazette_reference: 'LDA Bylaw No. MT-R/2019',
        permitted_uses: ['G+2 Residential', 'Parks', 'Schools', 'Clinics'],
        category: 'Residential Low-Density Conservation',
        color: '#EAB308'
      }
    }
  },

  {
    layerId: 'layer-lda-iqbaltown',
    name: 'Allama Iqbal Town Moon Market Commercial Corridor',
    department: 'LDA',
    zone_type: 'Commercial',
    color: '#EF4444',
    authority: 'LDA',
    far: '1:5',
    max_height_ft: 60,
    setback_front_ft: 15,
    setback_side_ft: 8,
    commercialization_status: 'Permanent (List A)',
    dc_rate_percent: 15,
    gazette_reference: 'LDA Gazette No. 22/2022-C',
    permitted_uses: ['Retail Markets', 'Offices', 'Mixed-Use', 'Showrooms'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.280, 31.500], [74.305, 31.500], [74.305, 31.525], [74.280, 31.525], [74.280, 31.500]]]
      },
      properties: {
        zone_name: 'Allama Iqbal Town Moon Market Corridor',
        zone_code: 'LDA-C-AIT',
        zone_type: 'Commercial',
        authority: 'LDA',
        far: '1:5',
        max_height_ft: 60,
        setback_front_ft: 15,
        setback_side_ft: 8,
        commercialization_status: 'Permanent (List A)',
        dc_rate_percent: 15,
        gazette_reference: 'LDA Gazette No. 22/2022-C',
        permitted_uses: ['Retail Markets', 'Offices', 'Mixed-Use', 'Showrooms'],
        category: 'Commercial Medium-Density',
        color: '#EF4444'
      }
    }
  },

  {
    layerId: 'layer-lda-sabzazar',
    name: 'Sabzazar Housing Scheme & Multan Road Corridor',
    department: 'LDA',
    zone_type: 'Residential',
    color: '#EAB308',
    authority: 'LDA',
    far: '1:4',
    max_height_ft: 38,
    setback_front_ft: 10,
    setback_side_ft: 5,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'LDA Bylaw No. SZ-R/2020',
    permitted_uses: ['G+2 Residential', 'Mosques', 'Community Halls'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.250, 31.490], [74.275, 31.490], [74.275, 31.515], [74.250, 31.515], [74.250, 31.490]]]
      },
      properties: {
        zone_name: 'Sabzazar Housing Scheme',
        zone_code: 'LDA-R-SBZ',
        zone_type: 'Residential',
        authority: 'LDA',
        far: '1:4',
        max_height_ft: 38,
        setback_front_ft: 10,
        setback_side_ft: 5,
        commercialization_status: 'None',
        dc_rate_percent: null,
        gazette_reference: 'LDA Bylaw No. SZ-R/2020',
        permitted_uses: ['G+2 Residential', 'Mosques', 'Community Halls'],
        category: 'Residential Medium-Density',
        color: '#EAB308'
      }
    }
  },

  {
    layerId: 'layer-lda-avenue1',
    name: 'LDA Avenue-1 & LDA City Master Development Boundary',
    department: 'LDA',
    zone_type: 'Residential',
    color: '#EAB308',
    authority: 'LDA',
    far: '1:4',
    max_height_ft: 45,
    setback_front_ft: 12,
    setback_side_ft: 6,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'LDA City Master Plan Notification 2050',
    permitted_uses: ['Residential', 'Mixed-Use Zones', 'Parks', 'Schools'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.220, 31.380], [74.260, 31.380], [74.260, 31.420], [74.220, 31.420], [74.220, 31.380]]]
      },
      properties: {
        zone_name: 'LDA Avenue-1 City Scheme',
        zone_code: 'LDA-R-AV1',
        zone_type: 'Residential',
        authority: 'LDA',
        far: '1:4',
        max_height_ft: 45,
        setback_front_ft: 12,
        setback_side_ft: 6,
        commercialization_status: 'None',
        dc_rate_percent: null,
        gazette_reference: 'LDA City Master Plan 2050',
        permitted_uses: ['Residential', 'Mixed-Use Zones', 'Parks', 'Schools'],
        category: 'Residential Planned Scheme',
        color: '#EAB308'
      }
    }
  },

  // ─────────── DHA LAHORE ZONES ───────────

  {
    layerId: 'layer-dha-phases',
    name: 'DHA Lahore Phases 1-9 & Raya Commercial Center Zone',
    department: 'DHA Lahore',
    zone_type: 'Residential',
    color: '#EAB308',
    authority: 'DHA Lahore',
    far: '1:4',
    max_height_ft: 48,
    setback_front_ft: 20,
    setback_side_ft: 10,
    commercialization_status: 'Permanent (List A)',
    dc_rate_percent: 20,
    gazette_reference: 'DHA Lahore Estate Act — General Order 2018',
    permitted_uses: ['Residential Villas', 'Apartments', 'Commercial Phases', 'Defence Raya Golf'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.375, 31.450], [74.450, 31.450], [74.450, 31.500], [74.375, 31.500], [74.375, 31.450]]]
      },
      properties: {
        zone_name: 'DHA Lahore All Phases (1–9)',
        zone_code: 'DHA-R-ALL',
        zone_type: 'Residential',
        authority: 'DHA Lahore',
        far: '1:4',
        max_height_ft: 48,
        setback_front_ft: 20,
        setback_side_ft: 10,
        commercialization_status: 'Permanent (List A)',
        dc_rate_percent: 20,
        gazette_reference: 'DHA Lahore Estate Act — GO 2018',
        permitted_uses: ['Residential Villas', 'Apartments', 'Commercial Phases', 'Defence Raya Golf'],
        category: 'DHA Residential & Commercial',
        color: '#EAB308'
      }
    }
  },

  // ─────────── WASA UTILITY LINES ───────────

  {
    layerId: 'layer-wasa-johar-trunk',
    name: 'WASA Johar Town Trunk Sewerage Protection Buffer Line',
    department: 'WASA',
    zone_type: 'Utility',
    color: '#06B6D4',
    authority: 'WASA',
    far: '',
    max_height_ft: null,
    setback_front_ft: null,
    setback_side_ft: null,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'WASA Engineering Order No. JT-SE/2020',
    permitted_uses: ['Sewerage Infrastructure', '15m Mandatory Buffer Zone'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[74.275, 31.465], [74.295, 31.480], [74.310, 31.490]]
      },
      properties: {
        zone_name: 'WASA Johar Town Trunk Sewerage Buffer',
        zone_code: 'WASA-U-JT',
        zone_type: 'Utility',
        authority: 'WASA',
        far: 'N/A',
        max_height_ft: null,
        setback_front_ft: null,
        setback_side_ft: null,
        commercialization_status: 'None',
        gazette_reference: 'WASA Engineering Order JT-SE/2020',
        permitted_uses: ['Sewerage Infrastructure', '15m Mandatory Buffer Zone'],
        category: 'WASA Trunk Utility Line',
        color: '#06B6D4'
      }
    }
  },

  {
    layerId: 'layer-wasa-ravi-water',
    name: 'WASA Water Treatment & Intake Buffer Protection Zone (Ravi)',
    department: 'WASA',
    zone_type: 'Agricultural',
    color: '#10B981',
    authority: 'WASA',
    far: '',
    max_height_ft: null,
    setback_front_ft: null,
    setback_side_ft: null,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'WASA Environmental Protection Order 2019',
    permitted_uses: ['Water Treatment Only', 'No Hazardous Waste Discharge', 'Green Belt Maintenance'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.300, 31.590], [74.330, 31.590], [74.330, 31.620], [74.300, 31.620], [74.300, 31.590]]]
      },
      properties: {
        zone_name: 'Ravi Aquifer Intake & Water Protection Buffer',
        zone_code: 'WASA-AG-RAVI',
        zone_type: 'Agricultural',
        authority: 'WASA',
        far: 'N/A',
        max_height_ft: null,
        setback_front_ft: null,
        setback_side_ft: null,
        commercialization_status: 'None',
        gazette_reference: 'WASA Environmental Protection Order 2019',
        permitted_uses: ['Water Treatment Only', 'No Hazardous Waste Discharge', 'Green Belt Maintenance'],
        category: 'Ravi Basin Green Belt & Aquifer Protection',
        color: '#10B981'
      }
    }
  },

  // ─────────── MCL ADMINISTRATIVE MARKET ZONES ───────────

  {
    layerId: 'layer-mcl-anarkali',
    name: 'MCL Anarkali & Shah Alami Market Commercial Control Zone',
    department: 'MCL',
    zone_type: 'Commercial',
    color: '#EF4444',
    authority: 'MCL',
    far: '1:6',
    max_height_ft: 60,
    setback_front_ft: 10,
    setback_side_ft: 5,
    commercialization_status: 'Permanent (List A)',
    dc_rate_percent: 20,
    gazette_reference: 'MCL Commercialization Notification ANK/2022',
    permitted_uses: ['Retail Bazaar', 'Cloth Market', 'Food Courts', 'Wholesale'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.310, 31.565], [74.330, 31.565], [74.330, 31.580], [74.310, 31.580], [74.310, 31.565]]]
      },
      properties: {
        zone_name: 'MCL Anarkali & Shah Alami Commercial Zone',
        zone_code: 'MCL-C-ANK',
        zone_type: 'Commercial',
        authority: 'MCL',
        far: '1:6',
        max_height_ft: 60,
        setback_front_ft: 10,
        setback_side_ft: 5,
        commercialization_status: 'Permanent (List A)',
        dc_rate_percent: 20,
        gazette_reference: 'MCL Notification ANK/2022',
        permitted_uses: ['Retail Bazaar', 'Cloth Market', 'Food Courts', 'Wholesale'],
        category: 'MCL Commercial Market Zone',
        color: '#EF4444'
      }
    }
  },

  {
    layerId: 'layer-mcl-ferozepur',
    name: 'MCL Ferozepur Road Commercial Spine Alignment (Ichhra to Shama)',
    department: 'MCL',
    zone_type: 'Commercial',
    color: '#EF4444',
    authority: 'MCL',
    far: '1:5',
    max_height_ft: 60,
    setback_front_ft: 20,
    setback_side_ft: 10,
    commercialization_status: 'Temporary Renewal',
    dc_rate_percent: 15,
    gazette_reference: 'MCL Road Corridor Order FRD/2021',
    permitted_uses: ['Commercial Strip', 'Showrooms', 'Restaurants', 'Fuel Stations'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[74.320, 31.520], [74.335, 31.490], [74.345, 31.460]]
      },
      properties: {
        zone_name: 'Ferozepur Road Commercial Spine (Ichhra–Shama)',
        zone_code: 'MCL-C-FRD',
        zone_type: 'Commercial',
        authority: 'MCL',
        far: '1:5',
        max_height_ft: 60,
        setback_front_ft: 20,
        setback_side_ft: 10,
        commercialization_status: 'Temporary Renewal',
        dc_rate_percent: 15,
        gazette_reference: 'MCL Road Corridor Order FRD/2021',
        permitted_uses: ['Commercial Strip', 'Showrooms', 'Restaurants', 'Fuel Stations'],
        category: 'Commercial Road Corridor',
        color: '#EF4444'
      }
    }
  },

  // ─────────── WALLED CITY & HERITAGE CONSERVATION ZONES ───────────

  {
    layerId: 'layer-wcca-walledcity',
    name: 'Walled City of Lahore (Shahi Qila & Delhi Gate Heritage Buffer)',
    department: 'Walled City Authority',
    zone_type: 'Heritage',
    color: '#06B6D4',
    authority: 'Walled City Authority',
    far: '1:1.5',
    max_height_ft: 30,
    setback_front_ft: 15,
    setback_side_ft: 10,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'Punjab Heritage Authority Act 2012 — WCA Heritage Buffer Notification',
    permitted_uses: ['Cultural Heritage Conservation', 'Tourism Facilities', 'Renovation Only', 'No New Construction'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.310, 31.580], [74.328, 31.580], [74.328, 31.595], [74.310, 31.595], [74.310, 31.580]]]
      },
      properties: {
        zone_name: 'Walled City — Shahi Qila & Delhi Gate Heritage Buffer',
        zone_code: 'WCA-H-WCL',
        zone_type: 'Heritage',
        authority: 'Walled City Authority',
        far: '1:1.5',
        max_height_ft: 30,
        setback_front_ft: 15,
        setback_side_ft: 10,
        commercialization_status: 'None',
        gazette_reference: 'Punjab Heritage Authority Act 2012 — WCA Buffer Notification',
        permitted_uses: ['Cultural Heritage Conservation', 'Tourism Facilities', 'Renovation Only', 'No New Construction'],
        category: 'Heritage Conservation Buffer — Strict Historical',
        color: '#06B6D4'
      }
    }
  },

  {
    layerId: 'layer-wcca-mallroad',
    name: 'Mall Road Special Heritage Conservation Corridor',
    department: 'Walled City Authority',
    zone_type: 'Heritage',
    color: '#06B6D4',
    authority: 'Walled City Authority',
    far: '1:2',
    max_height_ft: 30,
    setback_front_ft: 20,
    setback_side_ft: 12,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'LDA Heritage Corridor Bylaw MR/HC/2018',
    permitted_uses: ['Government Buildings', 'Museums', 'Consulates', 'Heritage Hotels'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.310, 31.555], [74.335, 31.555], [74.335, 31.565], [74.310, 31.565], [74.310, 31.555]]]
      },
      properties: {
        zone_name: 'Mall Road Special Heritage Conservation Corridor',
        zone_code: 'WCA-H-MLR',
        zone_type: 'Heritage',
        authority: 'Walled City Authority',
        far: '1:2',
        max_height_ft: 30,
        setback_front_ft: 20,
        setback_side_ft: 12,
        commercialization_status: 'None',
        gazette_reference: 'LDA Heritage Corridor Bylaw MR/HC/2018',
        permitted_uses: ['Government Buildings', 'Museums', 'Consulates', 'Heritage Hotels'],
        category: 'Heritage Conservation Corridor — 30ft Max Height Cap',
        color: '#06B6D4'
      }
    }
  },

  // ─────────── PERI-URBAN & MASTER PLAN 2050 ───────────

  {
    layerId: 'layer-sundar-industrial',
    name: 'Sundar Industrial Estate & Multan Road Industrial Belt',
    department: 'Urban Unit',
    zone_type: 'Industrial',
    color: '#A855F7',
    authority: 'Urban Unit / Punjab Industrial Estate',
    far: '1:3',
    max_height_ft: 60,
    setback_front_ft: 30,
    setback_side_ft: 15,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'Punjab Industrial Estate Act — Sundar Gazette 2015',
    permitted_uses: ['Manufacturing', 'Warehousing', 'Industrial High-Load', 'Heavy Transport'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.150, 31.280], [74.200, 31.280], [74.200, 31.330], [74.150, 31.330], [74.150, 31.280]]]
      },
      properties: {
        zone_name: 'Sundar Industrial Estate & Multan Road Belt',
        zone_code: 'UU-I-SNDR',
        zone_type: 'Industrial',
        authority: 'Urban Unit / Punjab Industrial Estate',
        far: '1:3',
        max_height_ft: 60,
        setback_front_ft: 30,
        setback_side_ft: 15,
        commercialization_status: 'None',
        gazette_reference: 'Punjab Industrial Estate Act — Sundar 2015',
        permitted_uses: ['Manufacturing', 'Warehousing', 'Industrial High-Load', 'Heavy Transport'],
        category: 'Industrial Belt — Sundar & Multan Road',
        color: '#A855F7'
      }
    }
  },

  {
    layerId: 'layer-masterplan-2050',
    name: 'All Lahore Metropolitan District Master Plan 2050 Boundary',
    department: 'Urban Unit',
    zone_type: 'Master Plan',
    color: '#38BDF8',
    authority: 'Urban Unit / LDA',
    far: '',
    max_height_ft: null,
    setback_front_ft: null,
    setback_side_ft: null,
    commercialization_status: 'None',
    dc_rate_percent: null,
    gazette_reference: 'Lahore Master Plan 2050 — Urban Unit Punjab',
    permitted_uses: ['City-Wide Planning Boundary', 'All Permitted Uses per Sub-Zone'],
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[74.100, 31.200], [74.500, 31.200], [74.500, 31.650], [74.100, 31.650], [74.100, 31.200]]]
      },
      properties: {
        zone_name: 'All Lahore Metropolitan District Boundary (2050)',
        zone_code: 'UU-MP-2050',
        zone_type: 'Master Plan',
        authority: 'Urban Unit / LDA',
        far: 'N/A',
        max_height_ft: null,
        setback_front_ft: null,
        setback_side_ft: null,
        commercialization_status: 'None',
        gazette_reference: 'Lahore Master Plan 2050 — Urban Unit Punjab',
        permitted_uses: ['City-Wide Planning Boundary', 'All Permitted Uses per Sub-Zone'],
        category: 'Lahore Metropolitan District Boundary — Master Plan 2050',
        color: '#38BDF8'
      }
    }
  }
];

async function seedInitialSpatialLayers() {
  if (mongoose.connection.readyState === 1) {
    try {
      await SpatialLayer.deleteMany({});
      await SpatialLayer.insertMany(initialSpatialLayers);
      console.log('[SpatialLayer] Seeded 15 All-Lahore GIS spatial layers (with full policy data) into MongoDB spatiallayers collection.');
    } catch (e) {
      console.warn('[SpatialLayer] Seed warning:', e.message);
    }
  }
}

module.exports = { SpatialLayer, seedInitialSpatialLayers, initialSpatialLayers };
