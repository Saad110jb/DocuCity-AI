import React, { useState, useEffect } from 'react';
import {
  Shield, Database, Lock, Eye, CheckCircle2, AlertTriangle, FileText,
  Play, Plus, Trash2, RefreshCw, Cpu, Layers, ShieldCheck, HelpCircle, Globe
} from 'lucide-react';
import axios from 'axios';

export function SecurityManagementPage() {
  const [namespaces, setNamespaces] = useState({
    publicCollection: {
      name: "docucity_public_bylaws",
      description: "Publicly accessible LDA gazette regulations, FAR rules, and zoning master plans stored in MongoDB Vector Search.",
      accessScope: "Public Citizen & Guest Access",
      totalChunks: 1024,
      totalDocuments: 14,
      status: "Active",
      vectorEngine: "MongoDB Vector Search"
    },
    internalOfficerCollection: {
      name: "docucity_internal_officer_gazette",
      description: "Restricted collection containing LDA internal committee approvals, officer notes, and pending bylaws in MongoDB.",
      accessScope: "Municipal Officers & Super Admin Only",
      totalChunks: 482,
      totalDocuments: 6,
      status: "Active",
      vectorEngine: "MongoDB Vector Search (AES-256)"
    }
  });

  const [redactionRules, setRedactionRules] = useState({
    cnicRedaction: true,
    phoneRedaction: true,
    ibanRedaction: true,
    emailRedaction: true,
    addressRedaction: false,
    severityLevel: "STRICT"
  });

  const [customPatterns, setCustomPatterns] = useState([
    { id: "pat-1", name: "Pakistani CNIC Pattern", pattern: "\\b\\d{5}-\\d{7}-\\d{1}\\b", replacement: "[CNIC REDACTED]", active: true },
    { id: "pat-2", name: "PK Phone Number Pattern", pattern: "(\\+92|0)?3\\d{2}[-\\s]?\\d{7}\\b", replacement: "[PHONE REDACTED]", active: true },
    { id: "pat-3", name: "Pakistani IBAN Bank Pattern", pattern: "PK\\d{2}[A-Z]{4}\\d{16}", replacement: "[IBAN REDACTED]", active: true },
    { id: "pat-4", name: "Plot Registration Serial", pattern: "LDA-REG-\\d{6}", replacement: "[SERIAL REDACTED]", active: false }
  ]);

  // Redaction Sandbox Tester State
  const [sampleInputText, setSampleInputText] = useState(
    "Citizen Applicant Ali Raza (CNIC: 35202-7386736-1, Phone: 0300-1234567) submitted plot approval LDA-REG-981204 under Johar Town Phase 2 bylaws. Account IBAN: PK36MEZN0001234567890123."
  );
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saveStatusNotice, setSaveStatusNotice] = useState('');

  // New Custom Rule Form State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleReplacement, setNewRuleReplacement] = useState('[REDACTED]');

  // Load live security config from MongoDB on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const token = localStorage.getItem('docucity_token');
        const res = await axios.get('http://localhost:5000/api/security/config', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data) {
          if (res.data.activeNamespaces) setNamespaces(res.data.activeNamespaces);
          if (res.data.redactionRules) setRedactionRules(res.data.redactionRules);
          if (res.data.customPatterns) setCustomPatterns(res.data.customPatterns);
        }
      } catch (e) {
        console.warn('Using default security rules');
      }
    }
    loadConfig();
  }, []);

  // Save changes directly to MongoDB
  const saveConfigToMongo = async (newRules, newPatterns) => {
    setSaveStatusNotice('Saving rules to MongoDB...');
    try {
      const token = localStorage.getItem('docucity_token');
      await axios.post('http://localhost:5000/api/security/config', {
        redactionRules: newRules || redactionRules,
        customPatterns: newPatterns || customPatterns
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSaveStatusNotice('Saved to MongoDB!');
      setTimeout(() => setSaveStatusNotice(''), 2500);
    } catch (e) {
      setSaveStatusNotice('Updated locally.');
      setTimeout(() => setSaveStatusNotice(''), 2500);
    }
  };

  const handleToggleRule = (ruleKey) => {
    const updated = { ...redactionRules, [ruleKey]: !redactionRules[ruleKey] };
    setRedactionRules(updated);
    saveConfigToMongo(updated, customPatterns);
  };

  const handleSeverityChange = (newSev) => {
    const updated = { ...redactionRules, severityLevel: newSev };
    setRedactionRules(updated);
    saveConfigToMongo(updated, customPatterns);
  };

  const handleTogglePattern = (patId) => {
    const updated = customPatterns.map(p => p.id === patId ? { ...p, active: !p.active } : p);
    setCustomPatterns(updated);
    saveConfigToMongo(redactionRules, updated);
  };

  const handleDeletePattern = (patId) => {
    const updated = customPatterns.filter(p => p.id !== patId);
    setCustomPatterns(updated);
    saveConfigToMongo(redactionRules, updated);
  };

  const handleAddPattern = (e) => {
    e.preventDefault();
    if (!newRuleName || !newRulePattern) return;
    const newPat = {
      id: `pat-${Date.now()}`,
      name: newRuleName,
      pattern: newRulePattern,
      replacement: newRuleReplacement,
      active: true
    };
    const updated = [...customPatterns, newPat];
    setCustomPatterns(updated);
    saveConfigToMongo(redactionRules, updated);
    setNewRuleName('');
    setNewRulePattern('');
  };

  const handleRunRedactionTest = async () => {
    setTesting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/security/redact-test', {
        sampleText: sampleInputText
      });
      setTestResult(res.data);
    } catch (err) {
      // Local client fallback tester logic
      let text = sampleInputText;
      const detected = [];

      if (redactionRules.cnicRedaction) {
        const cnicReg = /\b\d{5}-\d{7}-\d{1}\b/g;
        const matches = text.match(cnicReg) || [];
        matches.forEach(m => detected.push({ type: "CNIC", value: m }));
        text = text.replace(cnicReg, "[CNIC REDACTED]");
      }

      if (redactionRules.phoneRedaction) {
        const phoneReg = /(\+92|0)?3\d{2}[-\s]?\d{7}\b/g;
        const matches = text.match(phoneReg) || [];
        matches.forEach(m => detected.push({ type: "PHONE", value: m }));
        text = text.replace(phoneReg, "[PHONE REDACTED]");
      }

      if (redactionRules.ibanRedaction) {
        const ibanReg = /PK\d{2}[A-Z]{4}\d{16}/g;
        const matches = text.match(ibanReg) || [];
        matches.forEach(m => detected.push({ type: "IBAN", value: m }));
        text = text.replace(ibanReg, "[IBAN REDACTED]");
      }

      customPatterns.filter(p => p.active).forEach(p => {
        try {
          const reg = new RegExp(p.pattern, 'g');
          const matches = text.match(reg) || [];
          matches.forEach(m => detected.push({ type: p.name, value: m }));
          text = text.replace(reg, p.replacement);
        } catch (e) {}
      });

      setTestResult({
        originalText: sampleInputText,
        sanitizedText: text,
        redactedMatchesCount: detected.length,
        redactedDetails: detected
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in overflow-y-auto max-h-[calc(100vh-6rem)] pr-2 pb-24">
      {/* Header Title */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Security & Namespace Isolation Control</h1>
          </div>
          <p className="text-xs text-slate-400">
            Manage MongoDB Vector Search namespaces (Public vs Internal Officer collections) and configure automated PII/CNIC redaction filters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {saveStatusNotice && (
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-mono animate-pulse">
              {saveStatusNotice}
            </span>
          )}
          <div className="flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-purple-300 font-bold">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>SUPER_ADMIN_SECURITY_SCOPE</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Vector Collection Namespace Isolation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Isolated Vector Collection Namespaces (MongoDB)</span>
          </h2>
          <span className="text-xs text-slate-400">MongoDB Vector Search Access Control</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Collection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{namespaces.publicCollection.name}</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-semibold">
                    {namespaces.publicCollection.accessScope}
                  </span>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                {namespaces.publicCollection.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {namespaces.publicCollection.description}
            </p>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Vector Chunks</span>
                <span className="text-base font-extrabold text-emerald-400">{namespaces.publicCollection.totalChunks}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Documents</span>
                <span className="text-base font-extrabold text-white">{namespaces.publicCollection.totalDocuments}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Engine</span>
                <span className="text-[10px] font-mono font-bold text-slate-300 mt-1 block truncate">MongoDB Vector</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">Unclassified Public Policy Scope</span>
              <button className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Sync MongoDB Index</span>
              </button>
            </div>
          </div>

          {/* Internal Officer Restricted Collection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{namespaces.internalOfficerCollection.name}</h3>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono font-semibold">
                    {namespaces.internalOfficerCollection.accessScope}
                  </span>
                </div>
              </div>
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/40 font-bold">
                {namespaces.internalOfficerCollection.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {namespaces.internalOfficerCollection.description}
            </p>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Vector Chunks</span>
                <span className="text-base font-extrabold text-purple-400">{namespaces.internalOfficerCollection.totalChunks}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Documents</span>
                <span className="text-base font-extrabold text-white">{namespaces.internalOfficerCollection.totalDocuments}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Encryption</span>
                <span className="text-[10px] font-mono font-bold text-purple-300 mt-1 block truncate">MongoDB AES-256</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-purple-400 font-semibold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Isolated Target Namespace</span>
              </span>
              <button className="text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Sync MongoDB Index</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Automated PII & CNIC Redaction Filters & Rule Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Automated PII / CNIC Redaction Rules</span>
            </h2>
            <p className="text-xs text-slate-400">Configure real-time privacy sanitization filters before text vectorization in MongoDB</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Severity Mode:</span>
            <select
              value={redactionRules.severityLevel}
              onChange={(e) => handleSeverityChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-purple-400 px-3 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="STRICT">STRICT (CNIC + Phone + IBAN + Email)</option>
              <option value="STANDARD">STANDARD (CNIC + Phone)</option>
              <option value="CUSTOM">CUSTOM RULES ONLY</option>
            </select>
          </div>
        </div>

        {/* Rule Toggle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CNIC Redaction */}
          <div
            onClick={() => handleToggleRule('cnicRedaction')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              redactionRules.cnicRedaction
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-950 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-white">CNIC Sanitizer</p>
              <p className="text-[10px] text-slate-400 font-mono">35202-XXXXXXX-X</p>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              redactionRules.cnicRedaction ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              ✓
            </div>
          </div>

          {/* Phone Redaction */}
          <div
            onClick={() => handleToggleRule('phoneRedaction')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              redactionRules.phoneRedaction
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-950 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-white">Phone Sanitizer</p>
              <p className="text-[10px] text-slate-400 font-mono">03XX-XXXXXXX</p>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              redactionRules.phoneRedaction ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              ✓
            </div>
          </div>

          {/* IBAN Redaction */}
          <div
            onClick={() => handleToggleRule('ibanRedaction')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              redactionRules.ibanRedaction
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-950 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-white">Pakistani IBAN Mask</p>
              <p className="text-[10px] text-slate-400 font-mono">PKXXMEZN000...</p>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              redactionRules.ibanRedaction ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              ✓
            </div>
          </div>

          {/* Private Email Redaction */}
          <div
            onClick={() => handleToggleRule('emailRedaction')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              redactionRules.emailRedaction
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-950 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-white">Private Email Redaction</p>
              <p className="text-[10px] text-slate-400 font-mono">user@private.com</p>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              redactionRules.emailRedaction ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              ✓
            </div>
          </div>
        </div>

        {/* SECTION 3: Custom Regex Rules Manager */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Custom Regex Pattern Rules</h3>
          
          <div className="space-y-2">
            {customPatterns.map((pat) => (
              <div key={pat.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTogglePattern(pat.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] ${
                      pat.active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    ✓
                  </button>
                  <div>
                    <p className="font-bold text-white">{pat.name}</p>
                    <p className="text-[10px] font-mono text-purple-300">{pat.pattern} → <span className="text-emerald-400">{pat.replacement}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePattern(pat.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Custom Pattern Form */}
          <form onSubmit={handleAddPattern} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            <input
              type="text"
              placeholder="Rule Name (e.g. Serial Pattern)"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Regex Pattern (e.g. LDA-\\d{5})"
              value={newRulePattern}
              onChange={(e) => setNewRulePattern(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Replacement String"
              value={newRuleReplacement}
              onChange={(e) => setNewRuleReplacement(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Regex Rule</span>
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 4: Interactive Redaction Sandbox Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Play className="w-5 h-5 text-emerald-400" />
              <span>Live PII Redaction Sandbox Tester</span>
            </h2>
            <p className="text-xs text-slate-400">Test sample LDA gazette text against active security filters in real time</p>
          </div>

          <button
            onClick={handleRunRedactionTest}
            disabled={testing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{testing ? 'Executing Redaction Engine...' : 'Run Redaction Test'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sample Input */}
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">Input Text (Raw Gazette / Citizen Document):</label>
            <textarea
              rows={5}
              value={sampleInputText}
              onChange={(e) => setSampleInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          {/* Redacted Output Display */}
          <div>
            <label className="text-xs text-emerald-400 font-semibold mb-1 block">Sanitized Output (Ready for MongoDB Vector Storage):</label>
            <div className="w-full h-[115px] bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-300 font-mono leading-relaxed overflow-y-auto">
              {testResult ? testResult.sanitizedText : sampleInputText}
            </div>
          </div>
        </div>

        {/* Detected Redacted Entities Badge List */}
        {testResult && testResult.redactedDetails && testResult.redactedDetails.length > 0 && (
          <div className="pt-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Sanitized <span className="text-emerald-400 font-bold">{testResult.redactedMatchesCount} Sensitive Entities</span>:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {testResult.redactedDetails.map((det, idx) => (
                <span key={idx} className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {det.type}: {det.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
