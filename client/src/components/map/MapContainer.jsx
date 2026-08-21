import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { GeoJsonLayer } from './GeoJsonLayer';
import { ZoneTooltip } from './ZoneTooltip';
import { Layers, MapPin, Compass } from 'lucide-react';

export function MapContainerComponent({ geoJsonData, selectedZone, setSelectedZone, onAskRag }) {
  // Lahore coordinates center (31.5204° N, 74.3587° E)
  const lahoreCenter = [31.5204, 74.3587];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map MapContainer */}
      <LeafletMapContainer
        center={lahoreCenter}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {geoJsonData && (
          <GeoJsonLayer
            geoJsonData={geoJsonData}
            onSelectZone={(zone) => setSelectedZone(zone)}
          />
        )}

        <Marker position={lahoreCenter}>
          <Popup>
            <div className="text-slate-900 text-xs font-bold">
              Lahore Development Authority (LDA) Headquarters
            </div>
          </Popup>
        </Marker>
      </LeafletMapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute left-6 bottom-6 z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md shadow-xl text-xs space-y-2">
        <div className="flex items-center space-x-2 font-bold text-slate-200 border-b border-slate-800 pb-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>LDA Zoning Legend</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">Commercial High-Density (Gulberg)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">Residential Medium (Johar Town)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">Residential Low (Model Town)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">Heritage Special Corridor (Mall Rd)</span>
          </div>
        </div>
      </div>

      {/* Selected Zone Inspector Tooltip */}
      {selectedZone && (
        <ZoneTooltip
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onQueryZone={(zone) => onAskRag(`What are the specific building regulations and setbacks for ${zone.zone_name}?`, zone.zone_code)}
        />
      )}
    </div>
  );
}
