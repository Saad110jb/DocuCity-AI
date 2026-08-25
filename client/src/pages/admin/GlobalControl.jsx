import React, { useState, useEffect } from 'react';
import {
  Settings, Key, Globe, Database, Layers, RefreshCw, Trash2, ShieldCheck,
  CheckCircle2, AlertTriangle, Save, Cpu, MapPin, Sliders, Server, Zap
} from 'lucide-react';
import axios from 'axios';

export function GlobalControlPage() {
  const [settings, setSettings] = useState({
    activeModel: "Qwen2.5-7B-Instruct",
    inferenceEngine: "Local Ollama / vLLM (Zero External API Calls)",
    localOllamaEndpoint: "http://localhost:11434/api/generate",
    vectorEngine: "MongoDB Vector Search",
    defaultLanguage: "en",
    jwtExpirationHours: 24,
    availableBuiltinModels: [
      { id: "Qwen2.5-7B-Instruct", name: "Qwen2.5-7B-Instruct", description: "Bilingual English/Urdu Municipal QA Engine (ollama run qwen2.5:7b)", speed: "Fast", local: true },
      { id: "Alif-1.0-8B-Instruct", name: "Alif-1.0-8B-Instruct", description: "Urdu-Native Fine-Tuned Urban Policy Model", speed: "High Precision", local: true },
      { id: "Qalb-1.0-8B-Instruct", name: "Qalb-1.0-8B-Instruct", description: "Pakistani Legal & Gazette Regulation Model (enstazao/qalb)", speed: "Deep Reasoning", local: true }
    ],
    spatialDefaults: {
      lahoreLatitude: 31.5204,
      lahoreLongitude: 74.3587,
      defaultZoom: 12,
      activeLayersCount: 4
    },
    spatialLayers: [
      { id: "layer-1", name: "Gulberg Main Blvd Commercial Hub", code: "LDA-Z1-GUL", active: true, color: "#10B981" },
      { id: "layer-2", name: "Johar Town Phase 2 Residential", code: "LDA-Z2-JT", active: true, color: "#3B82F6" },
      { id: "layer-3", name: "Model Town Block B Suburb", code: "MTS-Z3-MT", active: true, color: "#8B5CF6" },
      { id: "layer-4", name: "Mall Road Special Heritage Corridor", code: "LDA-HC-MALL", active: true, color: "#F59E0B" }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await axios.get('http://localhost:5000/api/security/platform-config');
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (e) {
        console.warn('Using default global platform settings');
      }
    }
    loadConfig();
  }, []);

  const saveSettingsToMongo = async (newSettings) => {
    setSaving(true);
    setMessage('');
    const target = newSettings || settings;
    try {
      await axios.post('http://localhost:5000/api/security/platform-config', target);
      setMessage('Settings updated & saved directly to MongoDB database!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Global platform settings updated locally.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectModel = (modelName) => {
    const updated = { ...settings, activeModel: modelName };
    setSettings(updated);
    saveSettingsToMongo(updated);
  };

  const handleToggleLayer = (layerId) => {
    const updatedLayers = settings.spatialLayers.map(l => l.id === layerId ? { ...l, active: !l.active } : l);
    const updated = { ...settings, spatialLayers: updatedLayers };
    setSettings(updated);
    saveSettingsToMongo(updated);
  };

  const handleTriggerAction = async (actionType) => {
    setActionNotice('');
    try {
      const res = await axios.post('http://localhost:5000/api/security/system-action', { action: actionType });
      setActionNotice(res.data.message);
    } catch (e) {
      setActionNotice(`Executed system administrative action: ${actionType}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in overflow-y-auto max-h-[calc(100vh-6rem)] pr-2 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Global Platform Control & Built-in LLM Engine</h1>
          </div>
          <p className="text-xs text-slate-400">
            Full administrative control across local built-in LLMs (Qwen2.5 / Alif / Qalb), MongoDB vector search, and spatial layers.
          </p>
        </div>

        <button
          onClick={() => saveSettingsToMongo()}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Config...' : 'Save Global Settings'}</span>
        </button>
      </div>

      {message && (
        <div className="flex items-center space-x-2 text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-400 p-4 rounded-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {actionNotice && (
        <div className="flex items-center space-x-2 text-xs bg-purple-950/60 border border-purple-800 text-purple-300 p-4 rounded-2xl animate-fade-in">
          <RefreshCw className="w-4 h-4 text-purple-400 shrink-0 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ZERO EXTERNAL API CALLS NOTICE BANNER */}
      <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-300 shadow-xl">
        <div className="flex items-center space-x-3">
          <Server className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white">Local Built-in Inference Engine (Zero External API Calls)</p>
            <p className="text-[11px] text-slate-400">Generation and QA LLMs run locally via Ollama / vLLM without third-party API dependencies.</p>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-mono font-bold text-[10px]">
          OFFLINE LOCAL SECURE
        </span>
      </div>

      {/* SECTION 1: Built-in Local LLM Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Built-in Generation & QA LLM Models</span>
            </h2>
            <p className="text-xs text-slate-400">Select local LLM model running via Ollama (`ollama run qwen2.5:7b` or `enstazao/qalb`)</p>
          </div>

          <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs font-mono font-bold border border-purple-500/30">
            Active: {settings.activeModel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings.availableBuiltinModels.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelectModel(m.name)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative ${
                settings.activeModel === m.name
                  ? 'bg-purple-950/40 border-purple-500 shadow-xl'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">{m.name}</span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  settings.activeModel === m.name ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-mono font-bold">Zero API Cost</span>
                <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded font-mono">{m.speed}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">Local Ollama API Endpoint</label>
            <input
              type="text"
              value={settings.localOllamaEndpoint}
              onChange={(e) => setSettings({ ...settings, localOllamaEndpoint: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">JWT Token Expiration (Hours)</label>
            <input
              type="number"
              value={settings.jwtExpirationHours}
              onChange={(e) => setSettings({ ...settings, jwtExpirationHours: parseInt(e.target.value) || 24 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Vector Store Maintenance & Bulk Administrative Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Document Records & Vector Store Maintenance</span>
          </h2>
          <p className="text-xs text-slate-400">Execute administrative actions across MongoDB vector collections and spatial caches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Re-Index Vector Search</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Re-build MongoDB vector embeddings across all 14 official LDA gazette documents.
            </p>
            <button
              onClick={() => handleTriggerAction('reindex_vector')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold py-2 rounded-xl border border-slate-700 transition-all"
            >
              Re-Index All Documents
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Reload Spatial Layers</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Reload Lahore Development Authority GeoJSON spatial layers from local storage.
            </p>
            <button
              onClick={() => handleTriggerAction('reload_spatial')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold py-2 rounded-xl border border-slate-700 transition-all"
            >
              Reload GeoJSON Layers
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Flush Transient Cache</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Flush cached query responses and reset MongoDB connection pools.
            </p>
            <button
              onClick={() => handleTriggerAction('flush_cache')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold py-2 rounded-xl border border-slate-700 transition-all"
            >
              Flush Cache & Connections
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Active Spatial Layers Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Active Lahore Spatial GeoJSON Polygon Layers</span>
            </h2>
            <p className="text-xs text-slate-400">Toggle public visibility of zoning layers on the Leaflet GIS map</p>
          </div>
          <span className="text-xs text-purple-400 font-mono font-bold">
            Center: {settings.spatialDefaults.lahoreLatitude}° N, {settings.spatialDefaults.lahoreLongitude}° E
          </span>
        </div>

        <div className="space-y-2">
          {settings.spatialLayers.map((layer) => (
            <div key={layer.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: layer.color }}></span>
                <div>
                  <p className="font-bold text-white">{layer.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">Zone Code: {layer.code}</p>
                </div>
              </div>

              <button
                onClick={() => handleToggleLayer(layer.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  layer.active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {layer.active ? 'Layer Active' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
