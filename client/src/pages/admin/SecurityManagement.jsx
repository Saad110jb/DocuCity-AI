import React, { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiDatabase, 
  FiLock, 
  FiEye, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiPlay, 
  FiPlus, 
  FiTrash2, 
  FiRefreshCw, 
  FiLayers, 
  FiGlobe,
  FiHelpCircle
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiGovernmentLine 
} from 'react-icons/ri';
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
    propertyOwnerRedaction: true,
    ibanRedaction: true,
    emailRedaction: true,
    addressRedaction: false,
    severityLevel: "STRICT"
  });

  const [customPatterns, setCustomPatterns] = useState([
    { id: "pat-1", name: "Pakistani CNIC Pattern", pattern: "\\b\\d{5}-\\d{7}-\\d{1}\\b", replacement: "[CNIC REDACTED]", active: true },
    { id: "pat-2", name: "PK Phone Number Pattern", pattern: "(\\+92|0)?(3\\d{2}|42)[-\\s]?\\d{7,8}\\b", replacement: "[PHONE REDACTED]", active: true },
    { id: "pat-3", name: "Property Owner & Citizen Identity", pattern: "(?i)\\b(?:Property\\s*Owner|Plot\\s*Owner|Owner\\s*Name|Citizen\\s*Name)\\s*[:=-]\\s*([A-Za-z\\s\\.\\,\\'\\-]+?)(?=[,\\n\\r\\.\\;]|$)", replacement: "[PROPERTY OWNER REDACTED]", active: true },
    { id: "pat-4", name: "Pakistani IBAN Bank Pattern", pattern: "PK\\d{2}[A-Z]{4}\\d{16}", replacement: "[IBAN REDACTED]", active: true },
    { id: "pat-5", name: "Plot Registration Serial", pattern: "LDA-REG-\\d{6}", replacement: "[SERIAL REDACTED]", active: false }
  ]);

  // Redaction Sandbox Tester State
  const [sampleInputText, setSampleInputText] = useState(
    "Citizen Applicant Ali Raza S/O Tariq Mahmood (CNIC: 35202-7386736-1, Phone: 0300-1234567, Property Owner: Chaudhry Tariq Javed) submitted plot approval LDA-REG-981204 under Johar Town Phase 2 bylaws. Account IBAN: PK36MEZN0001234567890123."
  );
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saveStatusNotice, setSaveStatusNotice] = useState('');

  // Access Boundaries Simulation State
  const [simRole, setSimRole] = useState('public');
  const [simAction, setSimAction] = useState('modify_zoning_geometry');
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

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

  const handleTestRedaction = () => {
    setTesting(true);
    setTimeout(() => {
      let redacted = sampleInputText;
      // CNIC pattern
      if (redactionRules.cnicRedaction) {
        redacted = redacted.replace(/\b\d{5}-\d{7}-\d{1}\b/g, "[CNIC REDACTED]");
      }
      // Phone pattern
      if (redactionRules.phoneRedaction) {
        redacted = redacted.replace(/(\+92|0)?(3\d{2}|42)[-\s]?\d{7,8}\b/g, "[PHONE REDACTED]");
      }
      // IBAN pattern
      if (redactionRules.ibanRedaction) {
        redacted = redacted.replace(/PK\d{2}[A-Z]{4}\d{16}/g, "[IBAN REDACTED]");
      }
      // Property owner
      if (redactionRules.propertyOwnerRedaction) {
        redacted = redacted.replace(/Property\s*Owner:\s*[A-Za-z\s]+/gi, "Property Owner: [NAME REDACTED]");
      }

      setTestResult({
        original: sampleInputText,
        redacted: redacted,
        redactedItemsCount: 4,
        confidenceScore: 0.99
      });
      setTesting(false);
    }, 300);
  };

  const handleSimulateAccess = () => {
    setSimulating(true);
    setTimeout(() => {
      let allowed = false;
      let reason = "";

      if (simRole === 'admin') {
        allowed = true;
        reason = "Super Admin holds ROOT_ACCESS permissions across all municipal domains.";
      } else if (simRole === 'officer') {
        if (simAction === 'read_internal_gazette' || simAction === 'create_ocr_chunk' || simAction === 'generate_zoning_cert') {
          allowed = true;
          reason = "Verified municipal officer clearance granted for document review and certificate creation.";
        } else if (simAction === 'modify_zoning_geometry') {
          allowed = false;
          reason = "Zone geometry modifications require Super Admin approval.";
        }
      } else if (simRole === 'public') {
        if (simAction === 'read_public_bylaws' || simAction === 'ask_rag_ai') {
          allowed = true;
          reason = "Public statutory scope allows query and inspection of enacted bylaws.";
        } else {
          allowed = false;
          reason = "Access Denied: Internal documents and modifications require verified municipal credentials.";
        }
      }

      setSimResult({ allowed, reason, timestamp: new Date().toLocaleTimeString() });
      setSimulating(false);
    }, 250);
  };

  const handleTogglePattern = (id) => {
    setCustomPatterns(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleAddCustomRule = (e) => {
    e.preventDefault();
    if (!newRuleName || !newRulePattern) return;
    const newPat = {
      id: `pat-${Date.now()}`,
      name: newRuleName,
      pattern: newRulePattern,
      replacement: newRuleReplacement || '[REDACTED]',
      active: true
    };
    setCustomPatterns(prev => [...prev, newPat]);
    setNewRuleName('');
    setNewRulePattern('');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* ── 1. Vector Namespace Isolation ───────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FiDatabase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Vector Database Namespace Isolation</h2>
            <p className="text-xs text-neutral-400">Strict separation between public citizen queries and internal municipal draft collections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public Namespace */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                PUBLIC CITIZEN SCOPE
              </span>
              <span className="text-[11px] font-bold text-neutral-900">{namespaces.publicCollection.status}</span>
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-neutral-900">{namespaces.publicCollection.name}</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{namespaces.publicCollection.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-neutral-200/60 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 block font-bold">TOTAL CHUNKS</span>
                <span className="font-bold text-neutral-900">{namespaces.publicCollection.totalChunks}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 block font-bold">ENACTED DOCS</span>
                <span className="font-bold text-neutral-900">{namespaces.publicCollection.totalDocuments}</span>
              </div>
            </div>
          </div>

          {/* Internal Officer Namespace */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-neutral-900 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md">
                RESTRICTED OFFICER SCOPE
              </span>
              <span className="text-[11px] font-bold text-neutral-900">{namespaces.internalOfficerCollection.status}</span>
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-neutral-900">{namespaces.internalOfficerCollection.name}</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{namespaces.internalOfficerCollection.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-neutral-200/60 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 block font-bold">INTERNAL CHUNKS</span>
                <span className="font-bold text-neutral-900">{namespaces.internalOfficerCollection.totalChunks}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] text-neutral-400 block font-bold">RESTRICTED DOCS</span>
                <span className="font-bold text-neutral-900">{namespaces.internalOfficerCollection.totalDocuments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Automated PII Redaction Rules ──────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FiLock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Automated PII Redaction Enforcement</h2>
            <p className="text-xs text-neutral-400">Scrub citizen CNIC, phone numbers, private property deeds, and banking data prior to public indexing</p>
          </div>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'cnicRedaction', label: 'Pakistani CNIC Masking', desc: 'Masks 13-digit CNIC numbers with standard dashes' },
            { key: 'phoneRedaction', label: 'Phone Number Scrubbing', desc: 'Redacts local and international Pakistani mobile formats' },
            { key: 'propertyOwnerRedaction', label: 'Citizen & Owner Names', desc: 'Scrubs private deed names from public summaries' },
            { key: 'ibanRedaction', label: 'IBAN Banking Numbers', desc: 'Redacts bank account numbers and payment slips' },
            { key: 'emailRedaction', label: 'Email Address Scrubbing', desc: 'Removes private email addresses from notifications' },
            { key: 'addressRedaction', label: 'Private Home Addresses', desc: 'Redacts non-statutory private street addresses' },
          ].map((rule) => (
            <div
              key={rule.key}
              onClick={() => setRedactionRules(prev => ({ ...prev, [rule.key]: !prev[rule.key] }))}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                redactionRules[rule.key]
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
              }`}
            >
              <div className="space-y-1 pr-3">
                <p className="font-bold text-xs">{rule.label}</p>
                <p className={`text-[11px] leading-relaxed ${redactionRules[rule.key] ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {rule.desc}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                redactionRules[rule.key] ? 'bg-white text-neutral-900 font-bold text-xs' : 'border border-neutral-300'
              }`}>
                {redactionRules[rule.key] && '✓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Interactive Redaction Sandbox ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <FiPlay className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">Interactive Redaction Sandbox</h2>
              <p className="text-xs text-neutral-400">Test real-time regex redaction on municipal gazette and application snippets</p>
            </div>
          </div>

          <button
            onClick={handleTestRedaction}
            disabled={testing}
            className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <FiPlay className="w-3.5 h-3.5" />
            <span>{testing ? 'Testing...' : 'Execute Redaction Test'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Raw Ingestion Text</label>
            <textarea
              value={sampleInputText}
              onChange={(e) => setSampleInputText(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 text-xs text-neutral-800 font-mono leading-relaxed focus:bg-white focus:outline-none focus:border-neutral-900 resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Redacted Public Output</label>
            <div className="w-full bg-neutral-900 text-neutral-100 rounded-2xl p-3.5 text-xs font-mono leading-relaxed h-[104px] overflow-y-auto border border-neutral-800">
              {testResult ? testResult.redacted : <span className="text-neutral-500 italic">Click "Execute Redaction Test" to view sanitized output...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Access Boundaries Simulation ──────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Access Control & Boundary Simulator</h2>
            <p className="text-xs text-neutral-400">Simulate RBAC permissions for Citizen, Officer, and Admin actors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Actor Role</label>
            <select
              value={simRole}
              onChange={(e) => setSimRole(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="public">Public Citizen / Guest</option>
              <option value="officer">Municipal Officer (LDA / WASA)</option>
              <option value="admin">Super Administrator</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Target Action</label>
            <select
              value={simAction}
              onChange={(e) => setSimAction(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="read_public_bylaws">Read Enacted Public Bylaws</option>
              <option value="ask_rag_ai">Query Grounded RAG AI</option>
              <option value="read_internal_gazette">Read Internal Draft Gazettes</option>
              <option value="create_ocr_chunk">Edit OCR Parsed Chunks</option>
              <option value="generate_zoning_cert">Generate Official Zoning Certificate</option>
              <option value="modify_zoning_geometry">Modify Zone Boundary Coordinates</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateAccess}
              disabled={simulating}
              className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <FiPlay className="w-3.5 h-3.5" />
              <span>Simulate Permission</span>
            </button>
          </div>
        </div>

        {simResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
            simResult.allowed
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center space-x-2 font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${simResult.allowed ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              <span>{simResult.allowed ? 'ACTION PERMITTED' : 'ACCESS DENIED'}</span>
            </div>
            <p className="text-[11px] leading-relaxed">{simResult.reason}</p>
          </div>
        )}
      </div>

    </div>
  );
}
