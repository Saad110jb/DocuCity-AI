import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiMapPin, 
  FiLayers, 
  FiAlertTriangle, 
  FiArrowLeft, 
  FiSave, 
  FiSearch, 
  FiShield, 
  FiRefreshCw, 
  FiCompass, 
  FiEye, 
  FiCheckCircle, 
  FiXCircle,
  FiSliders,
  FiNavigation,
  FiEdit,
  FiMaximize2
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiMapPinLine 
} from 'react-icons/ri';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';
import { useSpatialStudio } from '../../hooks/useSpatialStudio';
import { MapContainerComponent } from '../../components/map/MapContainer';
import { OfficerHeader } from '../../components/officer/OfficerHeader';

// ── Leaflet CSS (must load exactly once) ─────────────────────────────────────
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function SpatialGisStudioPage({ onBack, department = 'LDA', officerUser, onOfficerLogout, setActiveView }) {
  const {
    resolveLocationToPolygon,
    generateRoadCorridor,
    checkConflicts,
    fetchDepartmentLayers,
    saveLayerGeometry,
    conflicts,
    loading,
  } = useSpatialStudio();

  const [locationQuery, setLocationQuery] = useState('Johar Town Phase 2');
  const [activePolygon, setActivePolygon] = useState({
    name: 'Johar Town Phase 2 Zone',
    coordinates: [[74.270, 31.460], [74.300, 31.460], [74.300, 31.485], [74.270, 31.485], [74.270, 31.460]],
  });

  const [roadName, setRoadName] = useState('Main Boulevard Gulberg');
  const [bufferMeters, setBufferMeters] = useState(30);
  const [corridorPolygon, setCorridorPolygon] = useState(null);

  const [layers, setLayers] = useState([]);
  const [layerSearchTerm, setLayerSearchTerm] = useState('');
  const [layerDepartmentFilter, setLayerDepartmentFilter] = useState('All');
  const [selectedLayerId, setSelectedLayerId] = useState('layer-lda-gulberg');
  const [saveNotice, setSaveNotice] = useState('');

  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    async function loadLayers() {
      const data = await fetchDepartmentLayers('All');
      setLayers(data);
    }
    loadLayers();
  }, []);

  const geoJsonData = useMemo(() => {
    const features = layers
      .filter(l => l.geojson && l.geojson.geometry)
      .map(l => ({
        type: 'Feature',
        geometry: l.geojson.geometry,
        properties: {
          ...l.geojson.properties,
          zone_name: l.geojson.properties?.zone_name || l.name,
          zone_code: l.geojson.properties?.zone_code || l.layerId,
          zone_type: l.geojson.properties?.zone_type || l.zone_type || 'Residential',
          authority: l.geojson.properties?.authority || l.authority || l.department,
          far: l.geojson.properties?.far || l.far || '',
          max_height_ft: l.geojson.properties?.max_height_ft || l.max_height_ft || null,
          setback_front_ft: l.geojson.properties?.setback_front_ft || l.setback_front_ft || null,
          setback_side_ft: l.geojson.properties?.setback_side_ft || l.setback_side_ft || null,
          commercialization_status: l.geojson.properties?.commercialization_status || l.commercialization_status || 'None',
          dc_rate_percent: l.geojson.properties?.dc_rate_percent || l.dc_rate_percent || null,
          gazette_reference: l.geojson.properties?.gazette_reference || l.gazette_reference || '',
          permitted_uses: l.geojson.properties?.permitted_uses || l.permitted_uses || [],
          category: l.geojson.properties?.category || '',
          color: l.color,
          layerId: l.layerId || l.id,
        },
      }));

    if (corridorPolygon) {
      features.push({
        type: 'Feature',
        geometry: corridorPolygon,
        properties: {
          zone_name: `${roadName} Corridor Buffer`,
          zone_code: 'CORR-BUFFER',
          zone_type: 'Commercial',
          authority: department,
          far: '1:8',
          max_height_ft: 120,
          setback_front_ft: 20,
          commercialization_status: 'Permanent (List A)',
          color: '#8B5CF6',
          layerId: 'corridor-temp'
        }
      });
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [layers, corridorPolygon, roadName, department]);

  const handleResolveLocation = async (e) => {
    e.preventDefault();
    if (!locationQuery) return;
    const poly = await resolveLocationToPolygon(locationQuery);
    if (poly) {
      setActivePolygon(poly);
      checkConflicts(poly.coordinates, department);
    }
  };

  const handleGenerateCorridor = async (e) => {
    e.preventDefault();
    if (!roadName) return;
    const corr = await generateRoadCorridor(roadName, bufferMeters);
    if (corr) {
      setCorridorPolygon(corr);
      checkConflicts(corr.coordinates, department);
    }
  };

  const handleSaveGeometry = async () => {
    const coordsToSave = activePolygon?.coordinates || corridorPolygon?.coordinates;
    if (!coordsToSave) {
      setSaveNotice('No active polygon to save. Resolve a location first.');
      setTimeout(() => setSaveNotice(''), 3000);
      return;
    }
    const success = await saveLayerGeometry(selectedLayerId, {
      type: 'Polygon',
      coordinates: coordsToSave,
    });
    if (success) {
      setSaveNotice(`Saved polygon geometry to MongoDB layer: ${selectedLayerId}`);
      setTimeout(() => setSaveNotice(''), 3500);
      const updated = await fetchDepartmentLayers('All');
      setLayers(updated);
    }
  };

  const filteredLayers = layers.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(layerSearchTerm.toLowerCase()) ||
                          l.layerId.toLowerCase().includes(layerSearchTerm.toLowerCase()) ||
                          (l.zone_type || '').toLowerCase().includes(layerSearchTerm.toLowerCase()) ||
                          (l.department || '').toLowerCase().includes(layerSearchTerm.toLowerCase());
    const matchesDept = layerDepartmentFilter === 'All' || l.department === layerDepartmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white">
      
      {/* Universal Officer Header */}
      <OfficerHeader
        activeView="gis"
        setActiveView={setActiveView || (() => {})}
        assignedDepartment={department}
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
      />

      {/* Main Studio Body */}
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Studio Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[11px] font-bold text-neutral-800 border border-neutral-200/70">
              <FiCompass className="w-3.5 h-3.5 text-neutral-800" />
              <span>Interactive Leaflet Vector Engine Active</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Spatial GIS Studio & Urban Zoning Geometry
            </h2>
            <p className="text-xs text-neutral-500 max-w-2xl font-normal">
              Resolve administrative boundaries, generate linear road buffers, and inspect complete municipal GIS layers.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {saveNotice && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
                {saveNotice}
              </span>
            )}
            <button
              onClick={handleSaveGeometry}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <FiSave className="w-3.5 h-3.5" />
              <span>Save Geometry Edits</span>
            </button>
          </div>
        </div>

        {/* Top Two Columns: Tools & Interactive Vector Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT TOOLS COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Tool 1: Geocoding & Boundary Resolution */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-3.5">
              <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Spatial Boundary Resolution</h3>
                  <p className="text-[10px] text-neutral-400">Resolve Lahore sectors into GeoJSON</p>
                </div>
              </div>

              <form onSubmit={handleResolveLocation} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">Location / Sector Name</label>
                  <div className="relative">
                    <FiSearch className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="e.g. Johar Town Phase 2, Gulberg III"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <FiCompass className="w-3.5 h-3.5" />
                  <span>{loading ? 'Resolving Boundary…' : 'Geocode & Resolve Boundary'}</span>
                </button>
              </form>

              {activePolygon?.name && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-[11px] font-mono text-neutral-700">
                  Active Polygon: <span className="font-bold text-neutral-900">{activePolygon.name}</span>
                </div>
              )}
            </div>

            {/* Tool 2: Road Corridor Centerline Mapping */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-3.5">
              <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                  <FiNavigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Linear Road Corridor Buffer</h3>
                  <p className="text-[10px] text-neutral-400">Generate commercial road buffers</p>
                </div>
              </div>

              <form onSubmit={handleGenerateCorridor} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">Road Spine Name</label>
                  <input
                    type="text"
                    value={roadName}
                    onChange={(e) => setRoadName(e.target.value)}
                    placeholder="e.g. Main Boulevard Gulberg"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-700">Buffer Width</label>
                    <span className="text-xs font-mono font-bold text-neutral-900">{bufferMeters}m</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={bufferMeters}
                    onChange={(e) => setBufferMeters(Number(e.target.value))}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <FiSliders className="w-3.5 h-3.5" />
                  <span>{loading ? 'Computing Buffer…' : 'Generate Corridor Buffer'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT MAP CONTAINER (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] h-[520px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <RiMapPinLine className="w-4 h-4 text-neutral-800" />
                  <span>Lahore Metropolitan Interactive Vector Map</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Real-time Leaflet Canvas
                </span>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden mt-3 border border-neutral-200 relative">
                <MapContainerComponent
                  geoJsonData={geoJsonData}
                  onZoneSelect={(zone) => setSelectedZone(zone)}
                  selectedZone={selectedZone}
                />
              </div>
            </div>
          </div>

        </div>

        {/* COMPLETE PROPER FULL-WIDTH ACTIVE GIS LAYERS SECTION (Rows like Analytics Page) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <FiLayers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Active GIS Spatial Layers ({filteredLayers.length})
                </h3>
                <p className="text-xs text-neutral-400">
                  Comprehensive repository of statutory zoning geometries, land-use classifications, and setback rules
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Department Filter Selector */}
              <select
                value={layerDepartmentFilter}
                onChange={(e) => setLayerDepartmentFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer font-medium"
              >
                <option value="All">All Departments</option>
                <option value="LDA">LDA Only</option>
                <option value="WASA">WASA Only</option>
                <option value="MCL">MCL Only</option>
                <option value="Urban Unit">Urban Unit Only</option>
              </select>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search layer name, zone..."
                  value={layerSearchTerm}
                  onChange={(e) => setLayerSearchTerm(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>
            </div>
          </div>

          {/* Full-width Detailed Layer Rows */}
          <div className="space-y-3">
            {filteredLayers.map((layer) => {
              const isSelected = selectedLayerId === (layer.layerId || layer.id);
              return (
                <div
                  key={layer.id || layer.layerId}
                  onClick={() => setSelectedLayerId(layer.layerId || layer.id)}
                  className={`border rounded-2xl p-5 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-50/90 border-neutral-900/80 ring-1 ring-neutral-900/20'
                      : 'bg-white hover:bg-neutral-50/50 border-neutral-200/80'
                  }`}
                >
                  {/* Left Layer Meta */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color || '#18181B' }} />
                      <h4 className="font-bold text-sm text-neutral-900 tracking-tight">{layer.name}</h4>
                      
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                        {layer.layerId || layer.id}
                      </span>

                      <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                        {layer.department}
                      </span>

                      <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                        {layer.zone_type || 'Zoning Corridor'}
                      </span>

                      {layer.commercialization_status && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          {layer.commercialization_status}
                        </span>
                      )}
                    </div>

                    {/* Bylaw Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs pt-1 text-neutral-600">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">FAR Limit</span>
                        <span className="font-bold text-neutral-900">{layer.far || '1:8 High Density'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Max Height</span>
                        <span className="font-bold text-neutral-900">{layer.max_height_ft ? `${layer.max_height_ft} ft` : '120 ft'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Front Setback</span>
                        <span className="font-bold text-neutral-900">{layer.setback_front_ft ? `${layer.setback_front_ft} ft` : '20 ft'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Side Setback</span>
                        <span className="font-bold text-neutral-900">{layer.setback_side_ft ? `${layer.setback_side_ft} ft` : '10 ft'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">DC Rate %</span>
                        <span className="font-bold text-neutral-900">{layer.dc_rate_percent ? `${layer.dc_rate_percent}%` : '20% DC Rate'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Gazette Ref</span>
                        <span className="font-bold text-neutral-900 truncate block">{layer.gazette_reference || 'LDA Gazette 2026'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLayerId(layer.layerId || layer.id);
                        setSelectedZone(layer.geojson?.properties || layer);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Active On Map' : 'Select Layer'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
