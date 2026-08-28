import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
import { GeoJsonLayer } from './GeoJsonLayer';
import { ZoneTooltip } from './ZoneTooltip';
import { Layers, Satellite, MapPin, Sparkles, Navigation, X, Info } from 'lucide-react';
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
    label: 'Vector Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: 'Satellite',
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

// Helper: Detect neighborhood from GPS coordinates if outside pre-defined polygons
function getNeighborhoodFromCoords(lat, lng) {
  if (lat >= 31.515 && lat <= 31.535 && lng >= 74.345 && lng <= 74.365) {
    return { name: 'Gulberg III Commercial Area', authority: 'LDA', zone_type: 'Commercial', far: '1:8', max_height_ft: 120, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'Permanent (List A) — 20% DC Rate', gazette_reference: 'LDA Gazette Notification 14/2023-C' };
  }
  if (lat >= 31.460 && lat <= 31.485 && lng >= 74.270 && lng <= 74.300) {
    return { name: 'Johar Town Scheme (Phase 1 & 2)', authority: 'LDA', zone_type: 'Residential', far: '1:4', max_height_ft: 38, setback_front_ft: 10, setback_side_ft: 5, commercialization_status: 'Temporary Renewal', gazette_reference: 'LDA Gazette 08/2021-R' };
  }
  if (lat >= 31.470 && lat <= 31.495 && lng >= 74.320 && lng <= 74.345) {
    return { name: 'Model Town Residential Conservation Zone', authority: 'LDA', zone_type: 'Residential', far: '1:3.5', max_height_ft: 38, setback_front_ft: 15, setback_side_ft: 7, commercialization_status: 'Strictly Prohibited', gazette_reference: 'LDA Bylaw MT-R/2019' };
  }
  if (lat >= 31.500 && lat <= 31.525 && lng >= 74.280 && lng <= 74.305) {
    return { name: 'Allama Iqbal Town & Moon Market', authority: 'LDA', zone_type: 'Commercial', far: '1:5', max_height_ft: 60, setback_front_ft: 15, setback_side_ft: 8, commercialization_status: 'Permanent (List A) — 15% DC Rate', gazette_reference: 'LDA Gazette 22/2022-C' };
  }
  if (lat >= 31.450 && lat <= 31.500 && lng >= 74.375 && lng <= 74.450) {
    return { name: 'DHA Lahore (Phases 1–9)', authority: 'DHA Lahore', zone_type: 'Residential / Commercial', far: '1:4', max_height_ft: 48, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'DHA Commercial Plots', gazette_reference: 'DHA Lahore Estate Act 2018' };
  }
  if (lat >= 31.580 && lat <= 31.595 && lng >= 74.310 && lng <= 74.328) {
    return { name: 'Walled City (Shahi Qila & Delhi Gate)', authority: 'Walled City Authority', zone_type: 'Heritage', far: '1:1.5', max_height_ft: 30, setback_front_ft: 15, setback_side_ft: 10, commercialization_status: 'Strict Conservation', gazette_reference: 'Punjab Heritage Act 2012' };
  }
  if (lat >= 31.555 && lat <= 31.565 && lng >= 74.310 && lng <= 74.335) {
    return { name: 'Mall Road Special Heritage Corridor', authority: 'WCLA & LDA', zone_type: 'Heritage', far: '1:2', max_height_ft: 30, setback_front_ft: 20, setback_side_ft: 12, commercialization_status: 'Preserved Facade Only', gazette_reference: 'LDA Heritage Corridor MR/2018' };
  }
  if (lat >= 31.530 && lat <= 31.550 && lng >= 74.290 && lng <= 74.315) {
    return { name: 'Samanabad & Chauburji Zone', authority: 'LDA', zone_type: 'Residential', far: '1:4', max_height_ft: 38, setback_front_ft: 10, setback_side_ft: 5, commercialization_status: '20% DC Rate on Main Multan Rd', gazette_reference: 'LDA Land Use Rules 2020' };
  }
  if (lat >= 31.530 && lat <= 31.545 && lng >= 74.325 && lng <= 74.345) {
    return { name: 'Shadman & Jail Road Corridor', authority: 'LDA', zone_type: 'Commercial', far: '1:6', max_height_ft: 90, setback_front_ft: 20, setback_side_ft: 10, commercialization_status: 'Permanent (List A)', gazette_reference: 'LDA Land Use Rules 2020' };
  }
  if (lat >= 31.490 && lat <= 31.510 && lng >= 74.310 && lng <= 74.335) {
    return { name: 'Garden Town & Faisal Town Scheme', authority: 'LDA', zone_type: 'Residential', far: '1:4', max_height_ft: 45, setback_front_ft: 12, setback_side_ft: 6, commercialization_status: '20% DC Rate on Barkat Market Spine', gazette_reference: 'LDA Land Use Rules 2020' };
  }
  if (lat >= 31.280 && lat <= 31.330 && lng >= 74.150 && lng <= 74.200) {
    return { name: 'Sundar Industrial Estate Belt', authority: 'Urban Unit / PIEDMC', zone_type: 'Industrial', far: '1:3', max_height_ft: 60, setback_front_ft: 30, setback_side_ft: 15, commercialization_status: 'Industrial Use Only', gazette_reference: 'Punjab Industrial Act 2015' };
  }
  if (lat >= 31.590 && lat <= 31.650 && lng >= 74.290 && lng <= 74.330) {
    return { name: 'Ravi Riverbed & Shahdara Green Belt', authority: 'WASA & EPA', zone_type: 'Agricultural', far: 'N/A', max_height_ft: null, setback_front_ft: 50, setback_side_ft: 50, commercialization_status: 'Strictly Prohibited', gazette_reference: 'WASA Environmental Order 2019' };
  }

  // General Lahore Location
  return {
    name: `Lahore Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`,
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
    click(e) {
      if (e.originalEvent && e.originalEvent._polygonClicked) {
        return; // Polygon click already handled
      }

      const { lat, lng } = e.latlng;
      let matchedZone = null;

      // 1. Check if point falls inside any loaded GeoJSON zone (ignoring giant master plan)
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

      // 2. If matched specific polygon
      if (matchedZone) {
        onSelectMapLocation(matchedZone, [lat, lng]);
        return;
      }

      // 3. Reverse detect area by coordinates
      const areaProfile = getNeighborhoodFromCoords(lat, lng);
      const customLocationZone = {
        zone_name: areaProfile.name,
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
  // Lahore city centre: 31.5204° N, 74.3587° E
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
    <div className="relative w-full h-full overflow-hidden rounded-2xl">

      {/* ── Leaflet Map ──────────────────────────────────────────────────── */}
      <LeafletMapContainer
        center={lahoreCenter}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0 cursor-crosshair"
        style={{ background: '#0f172a' }}
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
              <div className="text-slate-900 text-xs font-bold leading-tight">
                📍 {selectedZone?.zone_name || 'Selected Location'}<br />
                <span className="font-normal text-slate-600 font-mono text-[10px]">
                  {clickedPin[0].toFixed(4)}° N, {clickedPin[1].toFixed(4)}° E
                </span>
                <div className="mt-1 text-[10px] text-emerald-700 font-semibold">
                  RAG Chatbot locked to this area!
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* LDA HQ default marker */}
        <Marker position={lahoreCenter}>
          <Popup>
            <div className="text-slate-900 text-xs font-bold leading-snug">
              LDA Headquarters<br />
              <span className="font-normal text-slate-600">31.5204° N, 74.3587° E</span>
            </div>
          </Popup>
        </Marker>
      </LeafletMapContainer>

      {/* ── Top Floating Location Active Indicator ──────────────────────── */}
      {selectedZone && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[800] bg-slate-900/95 border border-emerald-500/50 px-4 py-2 rounded-2xl backdrop-blur-md shadow-2xl flex items-center space-x-3 text-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-slate-400 font-medium">Selected Location:</span>
            <span className="font-bold text-white max-w-[220px] md:max-w-xs truncate">
              {selectedZone.zone_name || selectedZone.name}
            </span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30">
            {selectedZone.authority || 'LDA'}
          </span>
          <button
            onClick={() => {
              setSelectedZone(null);
              setClickedPin(null);
            }}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
            title="Clear Selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Tile Switcher Button ─────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-[800] flex rounded-xl overflow-hidden border border-slate-700 shadow-xl">
        {Object.entries(TILE_LAYERS).map(([key, tile]) => (
          <button
            key={key}
            onClick={() => setTileKey(key)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-bold transition-all ${
              tileKey === key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {key === 'satellite' ? (
              <Satellite className="w-3.5 h-3.5" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
            <span>{tile.label}</span>
          </button>
        ))}
      </div>

      {/* ── Coordinate Badge ────────────────────────────────────────────── */}
      <div className="absolute bottom-20 right-3 z-[800] bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 shadow-lg">
        {clickedPin ? `${clickedPin[0].toFixed(4)}° N, ${clickedPin[1].toFixed(4)}° E` : '31.5204° N, 74.3587° E'} · EPSG:4326
      </div>

      {/* ── Zone Type Legend (bottom-left) ──────────────────────────────── */}
      <div className="absolute left-3 bottom-3 z-[800] bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl backdrop-blur-md shadow-xl text-xs space-y-2 max-w-[220px]">
        <div className="flex items-center space-x-2 font-bold text-slate-200 border-b border-slate-800 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Lahore Zoning Legend</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-start space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}90` }}
              />
              <div>
                <div className="text-slate-200 font-semibold leading-tight">{item.label}</div>
                <div className="text-slate-500 text-[10px]">{item.sub}</div>
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
          onQueryZone={(zone) =>
            onAskRag &&
            onAskRag(
              `What are the specific building regulations, FAR limits, and setback rules for ${zone.zone_name || zone.name}?`,
              zone.zone_code
            )
          }
        />
      )}
    </div>
  );
}
