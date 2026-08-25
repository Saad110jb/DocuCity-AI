const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
  configId: { type: String, default: 'global-platform-config', unique: true },
  activeModel: { type: String, default: "Qwen2.5-7B-Instruct" },
  inferenceEngine: { type: String, default: "Local Ollama / vLLM (Zero External API Calls)" },
  localOllamaEndpoint: { type: String, default: "http://localhost:11434/api/generate" },
  vectorEngine: { type: String, default: "MongoDB Vector Search" },
  defaultLanguage: { type: String, default: "en" },
  jwtExpirationHours: { type: Number, default: 24 },
  spatialDefaults: {
    lahoreLatitude: { type: Number, default: 31.5204 },
    lahoreLongitude: { type: Number, default: 74.3587 },
    defaultZoom: { type: Number, default: 12 },
    activeLayersCount: { type: Number, default: 4 }
  },
  spatialLayers: [
    {
      id: { type: String },
      name: { type: String },
      code: { type: String },
      active: { type: Boolean, default: true },
      color: { type: String }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

let PlatformConfig;
try {
  PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);
} catch (e) {
  PlatformConfig = mongoose.model('PlatformConfig');
}

const defaultPlatformConfigData = {
  configId: 'global-platform-config',
  activeModel: "Qwen2.5-7B-Instruct",
  inferenceEngine: "Local Ollama / vLLM (Zero External API Calls)",
  localOllamaEndpoint: "http://localhost:11434/api/generate",
  vectorEngine: "MongoDB Vector Search",
  defaultLanguage: "en",
  jwtExpirationHours: 24,
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
};

async function seedInitialPlatformConfig() {
  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await PlatformConfig.findOne({ configId: 'global-platform-config' });
      if (!existing) {
        await PlatformConfig.create(defaultPlatformConfigData);
        console.log('[PlatformConfig] Seeded initial platform settings into MongoDB platformconfigs collection.');
      }
    } catch (e) {
      console.warn('[PlatformConfig] Seed error:', e.message);
    }
  }
}

module.exports = { PlatformConfig, seedInitialPlatformConfig, defaultPlatformConfigData };
