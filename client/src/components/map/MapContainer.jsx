import React, { useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { GeoJsonLayer } from './GeoJsonLayer';
import { ZoneTooltip } from './ZoneTooltip';
import { Layers, Satellite } from 'lucide-react';

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

// ── Zone Legend Config (5 types per spec) ────────────────────────────────────
const LEGEND_ITEMS = [
  { color: '#EF4444', label: 'Commercial Zones', sub: 'FAR 1:8, 120ft max' },
  { color: '#EAB308', label: 'Residential Zones', sub: 'Height G+2 / 38ft, FAR 1:4' },
  { color: '#A855F7', label: 'Industrial Belts', sub: 'Sundar & Multan Road' },
  { color: '#10B981', label: 'Agricultural / Green Belts', sub: 'Ravi basin protection' },
  { color: '#06B6D4', label: 'Heritage Conservation', sub: 'Walled City & Mall Rd 30ft cap' },
];

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
  const activeTile = TILE_LAYERS[tileKey];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">

      {/* ── Leaflet Map ──────────────────────────────────────────────────── */}
      <LeafletMapContainer
        center={lahoreCenter}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          key={tileKey}
          attribution={activeTile.attribution}
          url={activeTile.url}
        />

        <ZoomControl position="topright" />

        {/* GeoJSON colour-coded zone polygons */}
        {geoJsonData && (
          <GeoJsonLayer
            geoJsonData={geoJsonData}
            onSelectZone={(zone) => setSelectedZone(zone)}
          />
        )}

        {/* LDA HQ marker */}
        <Marker position={lahoreCenter}>
          <Popup>
            <div className="text-slate-900 text-xs font-bold leading-snug">
              LDA Headquarters<br />
              <span className="font-normal text-slate-600">31.5204° N, 74.3587° E</span>
            </div>
          </Popup>
        </Marker>
      </LeafletMapContainer>

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
      <div className="absolute bottom-20 right-3 z-[800] bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400">
        31.5204° N, 74.3587° E · EPSG:4326
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
                style={{ backgroundColor: item.color, boxShadow: `0 0 5px ${item.color}70` }}
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
      {selectedZone && (
        <ZoneTooltip
          zone={selectedZone}
          conflicts={conflicts}
          onClose={() => setSelectedZone(null)}
          onQueryZone={(zone) =>
            onAskRag &&
            onAskRag(
              `What are the building regulations, FAR limits, and setback rules for ${zone.zone_name || zone.name}?`,
              zone.zone_code
            )
          }
        />
      )}
    </div>
  );
}
