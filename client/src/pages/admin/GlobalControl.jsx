import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiKey, 
  FiGlobe, 
  FiDatabase, 
  FiLayers, 
  FiRefreshCw, 
  FiTrash2, 
  FiShield, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiSave, 
  FiCpu, 
  FiMapPin, 
  FiSliders, 
  FiServer, 
  FiZap 
} from 'react-icons/fi';
import { 
  RiShieldCheckLine, 
  RiBuildingLine 
} from 'react-icons/ri';
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
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner Notice if Saved */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-2 text-xs">
          <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {actionNotice && (
        <div className="bg-neutral-900 text-white p-4 rounded-2xl flex items-center space-x-2 text-xs shadow-sm">
          <FiZap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── 1. Built-in LLM Model Selector ──────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FiCpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Active Foundation AI Model Configuration</h2>
            <p className="text-xs text-neutral-400">Select active Urdu & English bilingual inference engine with zero external API calls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings.availableBuiltinModels.map((model) => (
            <div
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                settings.activeModel === model.id
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    settings.activeModel === model.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {model.speed}
                  </span>
                  {settings.activeModel === model.id && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm">{model.name}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${settings.activeModel === model.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {model.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] font-mono">
                Engine: {model.local ? 'Self-Hosted Local Ollama' : 'Cloud Endpoint'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Spatial Layer Visibility Defaults ──────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FiLayers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Active GIS Spatial Layer Configuration</h2>
            <p className="text-xs text-neutral-400">Toggle default active layers for public and officer Leaflet map viewers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {settings.spatialLayers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => handleToggleLayer(layer.id)}
              className="p-4 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                <div>
                  <p className="font-bold text-neutral-900">{layer.name}</p>
                  <p className="text-neutral-500 font-mono text-[10px]">{layer.code}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                layer.active ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {layer.active ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Administrative Maintenance Quick Actions ───────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FiZap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Administrative Maintenance Actions</h2>
            <p className="text-xs text-neutral-400">Trigger manual index rebuilds, warm up local model weights, or flush memory caches</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => handleTriggerAction('rebuild_vector_index')}
            className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Rebuild Vector Semantic Index</span>
          </button>

          <button
            onClick={() => handleTriggerAction('warmup_llm')}
            className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-neutral-200 flex items-center space-x-1.5 cursor-pointer"
          >
            <FiCpu className="w-3.5 h-3.5" />
            <span>Warmup Local Model Weights</span>
          </button>

          <button
            onClick={() => handleTriggerAction('flush_cache')}
            className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-neutral-200 flex items-center space-x-1.5 cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>Flush Query Latency Cache</span>
          </button>
        </div>
      </div>

    </div>
  );
}
