import React, { useState, useEffect, useMemo } from 'react';
import {
  Map, MapPin, Layers, AlertTriangle, ArrowLeft, Save,
  Search, ShieldCheck, RefreshCw, Compass, Sparkles,
  Navigation, Satellite, Eye, CheckCircle2, XCircle
} from 'lucide-react';
import { useSpatialStudio } from '../../hooks/useSpatialStudio';
import { MapContainerComponent } from '../../components/map/MapContainer';

// ── Leaflet CSS (must load exactly once) ─────────────────────────────────────
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function SpatialGisStudioPage({ onBack, department = 'LDA' }) {
  const {
    resolveLocationToPolygon,
    generateRoadCorridor,
    checkConflicts,
    fetchDepartmentLayers,
    saveLayerGeometry,
    conflicts,
    loading,
  } = useSpatialStudio();

  // ── Spatial Resolution State ─────────────────────────────────────────────
  const [locationQuery, setLocationQuery] = useState('Johar Town Phase 2');
  const [activePolygon, setActivePolygon] = useState({
    name: 'Johar Town Phase 2 Zone',
    coordinates: [[74.270, 31.460], [74.300, 31.460], [74.300, 31.485], [74.270, 31.485], [74.270, 31.460]],
  });

  // ── Road Corridor State ──────────────────────────────────────────────────
  const [roadName, setRoadName] = useState('Main Boulevard Gulberg');
  const [bufferMeters, setBufferMeters] = useState(30);
  const [corridorPolygon, setCorridorPolygon] = useState(null);

  // ── Layer Management State ────────────────────────────────────────────────
  const [layers, setLayers] = useState([]);
  const [layerSearchTerm, setLayerSearchTerm] = useState('');
  const [layerDepartmentFilter, setLayerDepartmentFilter] = useState('All');
  const [selectedLayerId, setSelectedLayerId] = useState('layer-lda-gulberg');
  const [saveNotice, setSaveNotice] = useState('');

  // ── Map interaction state ─────────────────────────────────────────────────
  const [selectedZone, setSelectedZone] = useState(null);

  // ── Load Spatial Layers on mount ─────────────────────────────────────────
  useEffect(() => {
    async function loadLayers() {
      const data = await fetchDepartmentLayers('All');
      setLayers(data);
    }
    loadLayers();
  }, []);

  // ── Build GeoJSON FeatureCollection for the Leaflet map ──────────────────
  const geoJsonData = useMemo(() => {
    const features = layers
      .filter(l => l.geojson && l.geojson.geometry)
      .map(l => ({
        type: 'Feature',
        geometry: l.geojson.geometry,
        properties: {
          ...l.geojson.properties,
          // Ensure top-level fields are always in properties
          zone_name:    l.geojson.properties?.zone_name  || l.name,
          zone_code:    l.geojson.properties?.zone_code  || l.layerId,
          zone_type:    l.geojson.properties?.zone_type  || l.zone_type || 'Residential',
          authority:    l.geojson.properties?.authority  || l.authority || l.department,
          far:          l.geojson.properties?.far        || l.far || '',
          max_height_ft:l.geojson.properties?.max_height_ft || l.max_height_ft || null,
          setback_front_ft: l.geojson.properties?.setback_front_ft || l.setback_front_ft || null,
          setback_side_ft:  l.geojson.properties?.setback_side_ft  || l.setback_side_ft  || null,
          commercialization_status: l.geojson.properties?.commercialization_status || l.commercialization_status || 'None',
          dc_rate_percent: l.geojson.properties?.dc_rate_percent || l.dc_rate_percent || null,
          gazette_reference: l.geojson.properties?.gazette_reference || l.gazette_reference || '',
          permitted_uses: l.geojson.properties?.permitted_uses || l.permitted_uses || [],
          category:     l.geojson.properties?.category   || '',
          color:        l.color,
          layerId:      l.layerId || l.id,
        },
      }));

    // Also add the actively resolved polygon if it exists
    if (corridorPolygon) {
      features.push({
        type: 'Feature',
        geometry: corridorPolygon,
        properties: {
          zone_name: `${roadName} Corridor Buffer`,
          zone_code: 'CORR-BUFFER',
          zone_type: 'Commercial',
          authority: department,
          category: `${bufferMeters}m Road Corridor Buffer`,
          color: '#A855F7',
        },
      });
    }

    return features.length > 0
      ? { type: 'FeatureCollection', features }
      : null;
  }, [layers, corridorPolygon, roadName, bufferMeters, department]);

  // ── Filtered layers list (sidebar) ───────────────────────────────────────
  const filteredLayers = layers.filter(l => {
    const matchesDept =
      layerDepartmentFilter === 'All' ||
      l.department.toUpperCase().includes(layerDepartmentFilter.toUpperCase());
    const matchesSearch =
      l.name.toLowerCase().includes(layerSearchTerm.toLowerCase()) ||
      (l.layerId || '').toLowerCase().includes(layerSearchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // ── Zone click → auto-run conflict detection ──────────────────────────────
  const handleZoneSelected = async (zone) => {
    setSelectedZone(zone);
    if (zone) {
      await checkConflicts(department, {
        type: 'Polygon',
        coordinates: activePolygon.coordinates ? [activePolygon.coordinates] : [],
      }, zone.zone_type);
    }
  };

  // ── 1. Geocode & Resolve Boundary ────────────────────────────────────────
  const handleResolveLocation = async (e) => {
    e.preventDefault();
    if (!locationQuery) return;
    const geojson = await resolveLocationToPolygon(locationQuery);
    if (geojson && geojson.geometry) {
      setActivePolygon({ name: locationQuery, coordinates: geojson.geometry.coordinates[0] });
      await checkConflicts(department, geojson.geometry);
    }
  };

  // ── 2. Generate Linear Corridor Buffer ───────────────────────────────────
  const handleGenerateCorridor = async (e) => {
    e.preventDefault();
    if (!roadName) return;
    const polygon = await generateRoadCorridor(roadName, bufferMeters);
    if (polygon) {
      setCorridorPolygon(polygon);
      await checkConflicts(department, polygon);
    }
  };

  // ── 3. Save Vertex Geometry to MongoDB ───────────────────────────────────
  const handleSaveGeometry = async () => {
    if (!selectedLayerId) return;
    const res = await saveLayerGeometry(selectedLayerId, {
      type: 'Polygon',
      coordinates: [activePolygon.coordinates],
    });
    if (res) {
      setSaveNotice(`Geometry saved to MongoDB spatiallayers for ${selectedLayerId}!`);
      setTimeout(() => setSaveNotice(''), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-y-auto">

      {/* ── Header Bar ────────────────────────────────────────────────────── */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between z-10 backdrop-blur-md shrink-0 sticky top-0">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition-all flex items-center space-x-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </button>
          )}
          <div>
            <h1 className="font-bold text-sm text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>All-Lahore Spatial Policy & GIS Mapping Studio</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              OpenStreetMap Geocoding · Color-Coded Zoning · Click-to-Inspect Policy Cards · Multi-Dept Conflict Detection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {saveNotice && (
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-mono animate-pulse">
              {saveNotice}
            </span>
          )}
          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/30">
            {department} GIS Scope
          </span>
          <button
            onClick={handleSaveGeometry}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Vertex Edits to MongoDB</span>
          </button>
        </div>
      </header>

      {/* ── Page Content ──────────────────────────────────────────────────── */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ════ LEFT PANEL (4 cols) ════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-5">

            {/* TOOL 1: Automated Spatial Resolution */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Automated Spatial Resolution</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Convert Lahore place names / Union Councils into GeoJSON polygons via OSM
                </p>
              </div>
              <form onSubmit={handleResolveLocation} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold mb-1 block">
                    Location / Union Council Name
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="e.g. Johar Town Phase 2 / Gulberg III / DHA Phase 6"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{loading ? 'Resolving Polygon via OSM…' : 'Geocode & Resolve Boundary'}</span>
                </button>
              </form>
              {activePolygon?.name && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2 text-[10px] font-mono text-blue-300">
                  Active: <span className="font-bold text-white">{activePolygon.name}</span>
                </div>
              )}
            </div>

            {/* TOOL 2: Linear Road Corridor Mapping */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Navigation className="w-4 h-4 text-purple-400" />
                  <span>Corridor & Linear Policy Mapping</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Generate road centerline buffer polygons (Main Blvd, Ferozepur Rd, Ring Rd)
                </p>
              </div>
              <form onSubmit={handleGenerateCorridor} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold mb-1 block">Linear Road Name</label>
                  <input
                    type="text"
                    value={roadName}
                    onChange={(e) => setRoadName(e.target.value)}
                    placeholder="e.g. Main Boulevard Gulberg / Ferozepur Road"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400 font-semibold">Corridor Buffer Distance</label>
                    <span className="text-xs font-mono font-bold text-purple-400">{bufferMeters} meters</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={bufferMeters}
                    onChange={(e) => setBufferMeters(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{loading ? 'Computing Linear Buffer…' : 'Generate Linear Road Corridor'}</span>
                </button>
              </form>
              {corridorPolygon && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-3 py-2 text-[10px] font-mono text-purple-300">
                  Corridor: <span className="font-bold text-white">{roadName}</span> — {bufferMeters}m buffer rendered on map
                </div>
              )}
            </div>

            {/* TOOL 3: All-Lahore Multi-Department Layer Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Spatial Layers ({filteredLayers.length})</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">LDA · WASA · MCL · DHA · Walled City · Urban Unit</p>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                  MONGODB
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={layerSearchTerm}
                  onChange={(e) => setLayerSearchTerm(e.target.value)}
                  placeholder="Filter layers (Gulberg, WASA, DHA, Heritage)…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <div className="flex flex-wrap gap-1">
                  {['All', 'LDA', 'WASA', 'MCL', 'DHA Lahore', 'Walled City Authority', 'Urban Unit'].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setLayerDepartmentFilter(dept)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all ${
                        layerDepartmentFilter === dept
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredLayers.map((l) => {
                  const layerZoneType = l.zone_type || l.geojson?.properties?.zone_type || '';
                  return (
                    <div
                      key={l.layerId || l.id}
                      onClick={() => setSelectedLayerId(l.layerId || l.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        selectedLayerId === (l.layerId || l.id)
                          ? 'bg-slate-950 border-blue-500 ring-1 ring-blue-500/50'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 text-[11px] leading-snug truncate max-w-[160px]">
                            {l.name}
                          </p>
                          {layerZoneType && (
                            <p className="text-[9px] text-slate-500 font-mono">{layerZoneType}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-800 shrink-0">
                        {l.department}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ════ RIGHT PANEL (8 cols) ═══════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-5">

            {/* Interactive Leaflet GIS Canvas */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Map className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Leaflet.js Interactive GIS Map — Lahore Spatial Layers
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    CRS: EPSG:4326 / UTM 43N
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                    {layers.length} Layers Active
                  </span>
                </div>
              </div>

              {/* Leaflet Map Container */}
              <div className="relative w-full" style={{ height: '480px' }}>
                {loading && layers.length === 0 ? (
                  <div className="absolute inset-0 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800">
                    <div className="text-center space-y-2">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 font-mono">Loading All-Lahore GIS Layers…</p>
                    </div>
                  </div>
                ) : (
                  <MapContainerComponent
                    geoJsonData={geoJsonData}
                    selectedZone={selectedZone}
                    setSelectedZone={handleZoneSelected}
                    conflicts={conflicts}
                    onAskRag={(query, zoneCode) => console.log('RAG Query:', query, zoneCode)}
                  />
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>
                  Click any polygon to open the Policy Inspector Card. Zoom & pan enabled.
                </span>
                <span className="text-blue-400 font-bold">OSM Geocoding · EPSG:32643 Buffer Engine</span>
              </div>
            </div>

            {/* Spatial Conflict Detection Alert Panel */}
            <div className={`border rounded-3xl p-5 shadow-2xl space-y-3 ${
              conflicts.length > 0
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Topological Spatial Conflict Detection — Multi-Department Analysis</span>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold ${
                  conflicts.length > 0
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {conflicts.length > 0
                    ? `${conflicts.length} Overlap Conflict${conflicts.length > 1 ? 's' : ''} Detected`
                    : 'No Conflicts Found'}
                </span>
              </div>

              {conflicts.length === 0 && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 py-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Click a zone polygon on the map to run real-time conflict detection against LDA, WASA, MCL and Walled City Authority boundaries.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {conflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                          c.severity === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {c.severity}
                        </span>
                        <span className="font-bold text-white">{c.message}</span>
                      </div>
                      {c.requires_joint_approval && (
                        <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono shrink-0">
                          Joint Approval Required
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-mono">
                      <span>
                        Zone: <span className="text-amber-300 font-bold">{c.conflicting_zone_id}</span>
                      </span>
                      <span>
                        Dept: <span className="text-cyan-300 font-bold">{c.department}</span>
                      </span>
                      <span>
                        Overlap: <span className="text-slate-300">{c.overlap_area_sq_m} sq m</span>
                      </span>
                    </div>

                    {c.conflict_type && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Conflict Type: <span className="text-slate-300">{c.conflict_type}</span>
                        {c.resolution_body && (
                          <> · Resolution Body: <span className="text-blue-300">{c.resolution_body}</span></>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 font-mono pt-0.5 border-t border-slate-800">
                      Governing Rule: <span className="text-slate-400">{c.existing_rule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
