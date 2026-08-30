import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
import { GeoJsonLayer } from './GeoJsonLayer';
import { ZoneTooltip } from './ZoneTooltip';
import { 
  FiLayers, 
  FiMapPin, 
  FiNavigation, 
  FiX, 
  FiInfo, 
  FiCompass, 
  FiGlobe,
  FiEye
} from 'react-icons/fi';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';
import { 
  RiMapPinLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin marker icon for user selected point
const customSelectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ── Tile Layer Presets ────────────────────────────────────────────────────────
const TILE_LAYERS = {
  vector: {
    label: 'Vector Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
};

// ── Zone Legend Config ───────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { color: '#EF4444', label: 'Commercial Zones', sub: 'FAR 1:8, 120ft max height' },
  { color: '#F59E0B', label: 'Residential Zones', sub: 'Height G+2 / 38ft, FAR 1:4' },
  { color: '#A855F7', label: 'Industrial Belts', sub: 'Sundar & Multan Road' },
  { color: '#10B981', label: 'Agricultural & Green Belts', sub: 'Ravi basin protection' },
  { color: '#06B6D4', label: 'Heritage Conservation', sub: 'Walled City & Mall Rd (30ft cap)' },
];

// Helper: Point in polygon algorithm for ray-casting
function isPointInPolygon(point, polygonCoordinates) {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
    const xi = polygonCoordinates[i][0], yi = polygonCoordinates[i][1];
    const xj = polygonCoordinates[j][0], yj = polygonCoordinates[j][1];

    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

// Comprehensive Lahore Reverse Geocoding & Place Name Resolution
function getNeighborhoodFromCoords(lat, lng) {
  // Gulberg Commercial High-Density
  if (lat >= 31.510 && lat <= 31.538 && lng >= 74.340 && lng <= 74.368) {
    return { name: 'Gulberg III Commercial High-Density Zone', authority: 'LDA', zone_type: 'Commercial', far: '1:8', max_height_ft: 120, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'Permanent (List A) — 20% DC Rate', gazette_reference: 'LDA Gazette Notification 14/2023-C' };
  }
  // Johar Town Scheme
  if (lat >= 31.455 && lat <= 31.488 && lng >= 74.265 && lng <= 74.305) {
    return { name: 'Johar Town Scheme (Phase 1 & 2)', authority: 'LDA', zone_type: 'Residential', far: '1:4', max_height_ft: 38, setback_front_ft: 10, setback_side_ft: 5, commercialization_status: 'Temporary Renewal', gazette_reference: 'LDA Gazette 08/2021-R' };
  }
  // Model Town Conservation
  if (lat >= 31.468 && lat <= 31.498 && lng >= 74.318 && lng <= 74.348) {
    return { name: 'Model Town Conservation Sector', authority: 'LDA', zone_type: 'Residential', far: '1:3.5', max_height_ft: 38, setback_front_ft: 15, setback_side_ft: 7, commercialization_status: 'Strictly Prohibited', gazette_reference: 'LDA Bylaw MT-R/2019' };
  }
  // Baghbanpura & Shalimar Town GT Road Sector
  if (lat >= 31.560 && lat <= 31.605 && lng >= 74.400 && lng <= 74.520) {
    return { name: 'Baghbanpura & Shalimar GT Road Corridor', authority: 'MCL & LDA', zone_type: 'Commercial / Residential Mixed', far: '1:5', max_height_ft: 60, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'Permanent (List A) — 20% DC Rate', gazette_reference: 'LDA Building Regulations 2026' };
  }
  // Cantt & Cavalry Ground Sector
  if (lat >= 31.505 && lat <= 31.545 && lng >= 74.370 && lng <= 74.420) {
    return { name: 'Lahore Cantt & Cavalry Ground Commercial Area', authority: 'Military Lands & LDA', zone_type: 'Commercial / Mixed', far: '1:6', max_height_ft: 72, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'Cantt Board Approved Commercial', gazette_reference: 'Cantonment Board Bylaws 2021' };
  }
  // DHA Lahore (Phases 1-9 & Raya)
  if (lat >= 31.430 && lat <= 31.500 && lng >= 74.375 && lng <= 74.470) {
    return { name: 'DHA Lahore (Phases 1–9 & Defence Raya)', authority: 'DHA Lahore', zone_type: 'Residential / Commercial', far: '1:4 Residential, 1:6 Commercial', max_height_ft: 48, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'DHA Commercial Plots', gazette_reference: 'DHA Lahore Estate Act 2018' };
  }
  // Allama Iqbal Town & Moon Market
  if (lat >= 31.495 && lat <= 31.528 && lng >= 74.275 && lng <= 74.308) {
    return { name: 'Allama Iqbal Town & Moon Market Corridor', authority: 'LDA', zone_type: 'Commercial', far: '1:5', max_height_ft: 60, setback_front_ft: 15, setback_side_ft: 8, commercialization_status: 'Permanent (List A) — 15% DC Rate', gazette_reference: 'LDA Gazette 22/2022-C' };
  }
  // Walled City (Shahi Qila & Delhi Gate)
  if (lat >= 31.578 && lat <= 31.598 && lng >= 74.308 && lng <= 74.330) {
    return { name: 'Walled City (Shahi Qila & Delhi Gate Buffer)', authority: 'Walled City Authority', zone_type: 'Heritage', far: '1:1.5', max_height_ft: 30, setback_front_ft: 15, setback_side_ft: 10, commercialization_status: 'Strict Conservation', gazette_reference: 'Punjab Heritage Act 2012' };
  }
  // Mall Road Heritage Corridor
  if (lat >= 31.552 && lat <= 31.568 && lng >= 74.308 && lng <= 74.338) {
    return { name: 'Mall Road Heritage Conservation Corridor', authority: 'WCLA & LDA', zone_type: 'Heritage', far: '1:2', max_height_ft: 30, setback_front_ft: 20, setback_side_ft: 12, commercialization_status: 'Preserved Facade Only', gazette_reference: 'LDA Heritage Corridor MR/2018' };
  }
  // Sundar Industrial Estate Belt
  if (lat >= 31.280 && lat <= 31.335 && lng >= 74.148 && lng <= 74.205) {
    return { name: 'Sundar Industrial Estate Belt', authority: 'Urban Unit / PIEDMC', zone_type: 'Industrial', far: '1:3', max_height_ft: 60, setback_front_ft: 30, setback_side_ft: 15, commercialization_status: 'Industrial Use Only', gazette_reference: 'Punjab Industrial Act 2015' };
  }
  // Ravi Riverbed & Shahdara Green Belt
  if (lat >= 31.588 && lat <= 31.655 && lng >= 74.288 && lng <= 74.335) {
    return { name: 'Ravi Riverbed & Shahdara Green Belt', authority: 'WASA & EPA', zone_type: 'Agricultural', far: 'N/A', max_height_ft: null, setback_front_ft: 50, setback_side_ft: 50, commercialization_status: 'Strictly Prohibited', gazette_reference: 'WASA Environmental Order 2019' };
  }

  // Fallback: Lahore Metropolitan Sector
  let sectorName = 'Lahore Metropolitan Urban Sector';
  if (lat > 31.55) {
    sectorName = lng > 74.35 ? 'Baghbanpura / Eastern Lahore Sector' : 'Northern Lahore Urban Sector';
  } else {
    sectorName = lng > 74.35 ? 'Southern Lahore Sector (Cantt / DHA Extension)' : 'South-Western Lahore Housing Sector';
  }

  return {
    name: `${sectorName} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`,
    authority: 'LDA (Lahore Development Authority)',
    zone_type: 'Residential Medium-Density',
    far: '1:4 (Standard LDA Residential)',
    max_height_ft: 38,
    setback_front_ft: 10,
    setback_side_ft: 5,
    commercialization_status: 'Subject to LDA Gazette Notification',
    gazette_reference: 'LDA Building & Zoning Regulations 2026',
    isCustomCoordinate: true
  };
}

// ── Map Clicks & Pan Handler ──────────────────────────────────────────────────
function MapEventsHandler({ onSelectMapLocation, geoJsonData }) {
  useMapEvents({
    async click(e) {
      if (e.originalEvent && e.originalEvent._polygonClicked) {
        return;
      }

      const { lat, lng } = e.latlng;
      let matchedZone = null;

      if (geoJsonData && geoJsonData.features) {
        const specificFeatures = geoJsonData.features.filter(
          f => f.properties?.zone_type !== 'Master Plan' && f.properties?.layerId !== 'layer-masterplan-2050'
        );

        for (const feature of specificFeatures) {
          if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
            const ring = feature.geometry.coordinates[0];
            if (isPointInPolygon([lng, lat], ring)) {
              matchedZone = {
                ...feature.properties,
                clickedCoords: [lat, lng]
              };
              break;
            }
          }
        }
      }

      if (matchedZone) {
        onSelectMapLocation(matchedZone, [lat, lng]);
        return;
      }

      const areaProfile = getNeighborhoodFromCoords(lat, lng);
      
      const customLocationZone = {
        zone_name: areaProfile.name,
        place_name: areaProfile.name,
        zone_code: `LOC-${lat.toFixed(3)}-${lng.toFixed(3)}`,
        zone_type: areaProfile.zone_type,
        authority: areaProfile.authority,
        category: `${areaProfile.authority} Planning Jurisdiction`,
        far: areaProfile.far,
        max_height_ft: areaProfile.max_height_ft,
        setback_front_ft: areaProfile.setback_front_ft,
        setback_side_ft: areaProfile.setback_side_ft,
        commercialization_status: areaProfile.commercialization_status,
        gazette_reference: areaProfile.gazette_reference,
        permitted_uses: ['Residential Houses', 'Local Commercial Shops', 'Clinics', 'Community Spaces'],
        clickedCoords: [lat, lng],
        isCustomCoordinate: true
      };

      onSelectMapLocation(customLocationZone, [lat, lng]);

      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.address) {
            const addr = geoData.address;
            const suburb = addr.suburb || (addr.neighbourhood ? addr.neighbourhood.trim() : '') || addr.residential || addr.road || addr.subdistrict || addr.quarter;
            if (suburb) {
              const fullPlaceName = `${suburb}, ${areaProfile.authority} Jurisdiction (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
              const updatedZone = {
                ...customLocationZone,
                zone_name: fullPlaceName,
                place_name: suburb
              };
              onSelectMapLocation(updatedZone, [lat, lng]);
            }
          }
        }
      } catch (err) {}
    }
  });

  return null;
}

export function MapContainerComponent({
  geoJsonData,
  selectedZone,
  setSelectedZone,
  onAskRag,
  conflicts = [],
}) {
  const lahoreCenter = [31.5204, 74.3587];
  const [tileKey, setTileKey] = useState('vector');
  const [clickedPin, setClickedPin] = useState(null);
  const [showInspector, setShowInspector] = useState(true);
  const activeTile = TILE_LAYERS[tileKey];

  const handleSelectLocation = (zone, coords) => {
    setSelectedZone(zone);
    setShowInspector(true);
    if (coords) {
      setClickedPin(coords);
    } else if (zone && zone.clickedCoords) {
      setClickedPin(zone.clickedCoords);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* ── Leaflet Map ──────────────────────────────────────────────────── */}
      <LeafletMapContainer
        center={lahoreCenter}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0 cursor-crosshair"
        style={{ background: '#f8fafc' }}
      >
        <TileLayer
          key={tileKey}
          attribution={activeTile.attribution}
          url={activeTile.url}
        />

        <ZoomControl position="topright" />

        <MapEventsHandler
          onSelectMapLocation={handleSelectLocation}
          geoJsonData={geoJsonData}
        />

        {/* GeoJSON colour-coded zone polygons */}
        {geoJsonData && (
          <GeoJsonLayer
            geoJsonData={geoJsonData}
            selectedZone={selectedZone}
            onSelectZone={(zone, coords) => {
              const pin = coords ? [coords.lat, coords.lng] : null;
              handleSelectLocation(zone, pin);
            }}
          />
        )}

        {/* Clicked location custom marker */}
        {clickedPin && (
          <Marker position={clickedPin} icon={customSelectedIcon}>
            <Popup autoPan={false}>
              <div className="text-neutral-900 text-xs font-bold leading-tight font-sans">
                📍 {selectedZone?.zone_name || selectedZone?.name || 'Selected Location'}<br />
                <span className="font-normal text-neutral-500 font-mono text-[10px]">
                  {clickedPin[0].toFixed(4)}° N, {clickedPin[1].toFixed(4)}° E
                </span>
                <div className="mt-1 text-[10px] text-emerald-700 font-semibold">
                  RAG Assistant grounded to this plot!
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* LDA HQ default marker */}
        <Marker position={lahoreCenter}>
          <Popup>
            <div className="text-neutral-900 text-xs font-bold leading-snug font-sans">
              Lahore Development Authority (LDA HQ)<br />
              <span className="font-normal text-neutral-500 font-mono text-[10px]">31.5204° N, 74.3587° E</span>
            </div>
          </Popup>
        </Marker>
      </LeafletMapContainer>

      {/* ── Top Floating Location Active Indicator ──────────────────────── */}
      {selectedZone && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[800] bg-white border border-neutral-200/90 px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-3 text-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-neutral-400 font-semibold text-[11px]">Selected:</span>
            <span className="font-bold text-neutral-900 max-w-[260px] md:max-w-md truncate">
              {selectedZone.zone_name || selectedZone.name}
            </span>
          </div>
          <span className="bg-neutral-100 text-neutral-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-neutral-200">
            {selectedZone.authority || 'LDA'}
          </span>
          <button
            onClick={() => {
              setSelectedZone(null);
              setClickedPin(null);
            }}
            className="text-neutral-400 hover:text-neutral-900 p-1 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
            title="Clear Selection"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Tile Switcher Button ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-[800] flex bg-white rounded-2xl p-1 border border-neutral-200/90 shadow-md">
        {Object.entries(TILE_LAYERS).map(([key, tile]) => (
          <button
            key={key}
            onClick={() => setTileKey(key)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tileKey === key
                ? 'bg-neutral-900 text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiLayers className="w-3.5 h-3.5" />
            <span>{tile.label}</span>
          </button>
        ))}
      </div>

      {/* ── Coordinate Badge (Positioned safely away from the right-side chat drawer) ── */}
      <div className="absolute bottom-4 left-[248px] z-[800] bg-white border border-neutral-200/90 px-3 py-1.5 rounded-xl text-[10px] font-mono text-neutral-600 shadow-md hidden sm:block">
        {clickedPin ? `${clickedPin[0].toFixed(4)}° N, ${clickedPin[1].toFixed(4)}° E` : '31.5204° N, 74.3587° E'} · EPSG:4326
      </div>

      {/* ── Zone Type Legend (bottom-left) ──────────────────────────────── */}
      <div className="absolute left-4 bottom-4 z-[800] bg-white border border-neutral-200/90 p-4 rounded-3xl shadow-xl text-xs space-y-2.5 max-w-[230px] font-sans">
        <div className="flex items-center space-x-2 font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          <FiLayers className="w-3.5 h-3.5 text-neutral-700" />
          <span>Lahore Zoning Legend</span>
        </div>
        <div className="space-y-2 text-[11px]">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-start space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="text-neutral-900 font-bold leading-tight">{item.label}</div>
                <div className="text-neutral-400 text-[10px]">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Policy Inspector Card (on zone click) ────────────────────────── */}
      {selectedZone && showInspector && (
        <ZoneTooltip
          zone={selectedZone}
          conflicts={conflicts}
          onClose={() => setShowInspector(false)}
          onQueryZone={(zone) => {
            const cleanPlaceName = zone.place_name || zone.zone_name?.replace(/\s*\([\d\.\s°NE,\-]+\)/g, '') || zone.name;
            if (onAskRag) {
              onAskRag(
                `What are the specific building regulations, FAR limits, and setback rules for ${cleanPlaceName}?`,
                zone.zone_code
              );
            }
          }}
        />
      )}
    </div>
  );
}
