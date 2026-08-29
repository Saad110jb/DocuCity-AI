const mongoose = require('mongoose');

const securityConfigSchema = new mongoose.Schema({
  configId: { type: String, default: 'global-security-config', unique: true },
  activeNamespaces: {
    publicCollection: {
      name: { type: String, default: "docucity_public_bylaws" },
      description: { type: String, default: "Publicly accessible LDA gazette regulations, FAR rules, and zoning master plans stored in ChromaDB & MongoDB Vector Search." },
      accessScope: { type: String, default: "Public Citizen & Guest Access (Read-Only)" },
      totalChunks: { type: Number, default: 1024 },
      totalDocuments: { type: Number, default: 14 },
      status: { type: String, default: "Active" },
      vectorEngine: { type: String, default: "ChromaDB & MongoDB Isolated Namespace" }
    },
    internalOfficerCollection: {
      name: { type: String, default: "docucity_internal_officer_gazette" },
      description: { type: String, default: "Restricted collection containing LDA internal committee approvals, officer notes, and pending draft bylaws." },
      accessScope: { type: String, default: "Municipal Officers & Super Admin Only" },
      totalChunks: { type: Number, default: 482 },
      totalDocuments: { type: Number, default: 6 },
      status: { type: String, default: "Active" },
      vectorEngine: { type: String, default: "ChromaDB & MongoDB (AES-256 Restricted)" }
    }
  },
  redactionRules: {
    cnicRedaction: { type: Boolean, default: true },
    phoneRedaction: { type: Boolean, default: true },
    propertyOwnerRedaction: { type: Boolean, default: true },
    ibanRedaction: { type: Boolean, default: true },
    emailRedaction: { type: Boolean, default: true },
    addressRedaction: { type: Boolean, default: false },
    severityLevel: { type: String, default: "STRICT" }
  },
  accessBoundaries: {
    isolatedVectorNamespace: { type: Boolean, default: true },
    automatedPiiRedaction: { type: Boolean, default: true },
    readOnlyPublicEnforcement: { type: Boolean, default: true }
  },
  customPatterns: [
    {
      id: { type: String },
      name: { type: String },
      pattern: { type: String },
      replacement: { type: String },
      active: { type: Boolean, default: true }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

let SecurityConfig;
try {
  SecurityConfig = mongoose.model('SecurityConfig', securityConfigSchema);
} catch (e) {
  SecurityConfig = mongoose.model('SecurityConfig');
}

const defaultSecurityConfigData = {
  configId: 'global-security-config',
  activeNamespaces: {
    publicCollection: {
      name: "docucity_public_bylaws",
      description: "Publicly accessible LDA gazette regulations, FAR rules, and zoning master plans stored in ChromaDB & MongoDB Vector Search.",
      accessScope: "Public Citizen & Guest Access (Read-Only)",
      totalChunks: 1024,
      totalDocuments: 14,
      status: "Active",
      vectorEngine: "ChromaDB & MongoDB Isolated Namespace"
    },
    internalOfficerCollection: {
      name: "docucity_internal_officer_gazette",
      description: "Restricted collection containing LDA internal committee approvals, officer notes, and pending draft bylaws.",
      accessScope: "Municipal Officers & Super Admin Only",
      totalChunks: 482,
      totalDocuments: 6,
      status: "Active",
      vectorEngine: "ChromaDB & MongoDB (AES-256 Restricted)"
    }
  },
  redactionRules: {
    cnicRedaction: true,
    phoneRedaction: true,
    propertyOwnerRedaction: true,
    ibanRedaction: true,
    emailRedaction: true,
    addressRedaction: false,
    severityLevel: "STRICT"
  },
  accessBoundaries: {
    isolatedVectorNamespace: true,
    automatedPiiRedaction: true,
    readOnlyPublicEnforcement: true
  },
  customPatterns: [
    { id: "pat-1", name: "Pakistani CNIC Pattern", pattern: "\\b\\d{5}-\\d{7}-\\d{1}\\b", replacement: "[CNIC REDACTED]", active: true },
    { id: "pat-2", name: "PK Phone Number Pattern", pattern: "(\\+92|0)?(3\\d{2}|42)[-\\s]?\\d{7,8}\\b", replacement: "[PHONE REDACTED]", active: true },
    { id: "pat-3", name: "Property Owner & Citizen Identity", pattern: "(?i)\\b(?:Property\\s*Owner|Plot\\s*Owner|Owner\\s*Name|Citizen\\s*Name)\\s*[:=-]\\s*([A-Za-z\\s\\.\\,\\'\\-]+?)(?=[,\\n\\r\\.\\;]|$)", replacement: "[PROPERTY OWNER REDACTED]", active: true },
    { id: "pat-4", name: "Pakistani IBAN Bank Pattern", pattern: "PK\\d{2}[A-Z]{4}\\d{16}", replacement: "[IBAN REDACTED]", active: true },
    { id: "pat-5", name: "Plot Registration Serial", pattern: "LDA-REG-\\d{6}", replacement: "[SERIAL REDACTED]", active: false }
  ]
};

async function seedInitialSecurityConfig() {
  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await SecurityConfig.findOne({ configId: 'global-security-config' });
      if (!existing) {
        await SecurityConfig.create(defaultSecurityConfigData);
        console.log('[SecurityConfig] Seeded initial security rules into MongoDB securityconfigs collection.');
      }
    } catch (e) {
      console.warn('[SecurityConfig] Seed error:', e.message);
    }
  }
}

module.exports = { SecurityConfig, seedInitialSecurityConfig, defaultSecurityConfigData };
