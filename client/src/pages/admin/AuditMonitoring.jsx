import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiFileText, 
  FiCpu, 
  FiClock, 
  FiRefreshCw, 
  FiSearch, 
  FiShield, 
  FiZap, 
  FiLayers, 
  FiServer,
  FiCheck
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import axios from 'axios';

export function AuditMonitoringPage() {
  const [metrics, setMetrics] = useState({
    totalApiRequests: 1420,
    successfulRequests: 1398,
    failedRequests: 22,
    averageLatencyMs: 342,
    totalPromptTokens: 489200,
    totalCompletionTokens: 142800,
    activeModel: "Qwen2.5-7B-Instruct",
    costEstimateUsd: 0.00
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "audit-001",
      timestamp: "2026-08-25T22:30:15.102Z",
      user: { name: "Officer Tariq Mahmood", role: "officer" },
      action: "DOCUMENT_UPLOAD",
      documentId: "doc-89a1f2c",
      details: { filename: "LDA_Gulberg_Commercial_Notification_2024.pdf" }
    },
    {
      id: "audit-002",
      timestamp: "2026-08-25T21:45:00.890Z",
      user: { name: "Public Citizen", role: "public" },
      action: "RAG_QUERY",
      documentId: "N/A",
      details: { query: "What is the allowed FAR in Johar Town Phase 2?" }
    },
    {
      id: "audit-003",
      timestamp: "2026-08-25T20:10:33.412Z",
      user: { name: "Super Admin - PITB", role: "admin" },
      action: "OFFICER_PROVISION",
      documentId: "usr-off-202",
      details: { officer: "saad@lda.gop.pk", department: "LDA" }
    }
  ]);

  const [pipelineErrors, setPipelineErrors] = useState([
    {
      id: "err-101",
      timestamp: "2026-08-25T22:14:02.182Z",
      stage: "OCR Extraction",
      errorType: "PyPDF2 Empty Text Exception",
      message: "PDF page 4 contains unreadable scanned bitmap image. Fallback OCR engaged.",
      target: "LDA_Zone1_Gazette_2024.pdf",
      resolved: false
    },
    {
      id: "err-102",
      timestamp: "2026-08-25T20:45:11.901Z",
      stage: "Geocoding Spatial Query",
      errorType: "Shapely Point Out of Polygon Bounds",
      message: "Point [74.4501, 31.3901] fell outside registered LDA zoning polygon bounds. Defaulted to nearest district.",
      target: "Point Query (31.3901 N, 74.4501 E)",
      resolved: true
    },
    {
      id: "err-103",
      timestamp: "2026-08-25T18:30:44.210Z",
      stage: "LLM RAG Generation",
      errorType: "Local Ollama Timeout",
      message: "Local Qwen2.5-7B latency exceeded 3000ms. Offline fallback vector response served.",
      target: "Query: 'What are setback rules in Johar Town?'",
      resolved: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('audit');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get('http://localhost:5000/api/security/audit-monitoring');
        if (res.data) {
          if (res.data.metrics) setMetrics(prev => ({ ...prev, ...res.data.metrics }));
          if (res.data.auditLogs && res.data.auditLogs.length > 0) setAuditLogs(res.data.auditLogs);
          if (res.data.pipelineErrors && res.data.pipelineErrors.length > 0) setPipelineErrors(res.data.pipelineErrors);
        }
      } catch (e) {
        console.warn('Using default audit and monitoring data');
      }
    }
    loadData();
  }, []);

  const handleResolveError = async (id) => {
    setPipelineErrors(prev => prev.map(err => err.id === id ? { ...err, resolved: true } : err));
    try {
      await axios.put(`http://localhost:5000/api/security/audit-monitoring/errors/${id}/resolve`);
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* ── Metric Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Ingestion & Inquiries</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">{metrics.totalApiRequests.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">98.4% Success Rate</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Average RAG Latency</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">{metrics.averageLatencyMs} <span className="text-sm font-medium text-neutral-500">ms</span></p>
          <p className="text-[11px] text-neutral-500 font-mono mt-1">ChromaDB + Gemini 1.5</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Token Throughput</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">{((metrics.totalPromptTokens + metrics.totalCompletionTokens) / 1000).toFixed(0)} <span className="text-sm font-medium text-neutral-500">k</span></p>
          <p className="text-[11px] text-neutral-500 font-mono mt-1">Grounded token stream</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Inference Compute Cost</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">$0.00</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Self-Hosted Local Engine</p>
        </div>
      </div>

      {/* ── Tabs & Log Viewer ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <FiActivity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">System Audit Trail & Telemetry</h2>
              <p className="text-xs text-neutral-400">Chronological governance audit log of document uploads, queries, and officer provisioning</p>
            </div>
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shrink-0">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'audit' ? 'bg-white text-neutral-900 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Audit Logs ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'errors' ? 'bg-white text-neutral-900 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Pipeline Errors ({pipelineErrors.filter(e => !e.resolved).length})
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        {activeTab === 'audit' ? (
          <div className="space-y-3 pt-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-neutral-50/70 border border-neutral-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-neutral-900">{log.user.name}</span>
                    <span className="bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {log.user.role.toUpperCase()}
                    </span>
                    <span className="bg-neutral-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-neutral-500 font-mono text-[11px]">
                    {log.details.filename || log.details.query || log.details.officer || JSON.stringify(log.details)}
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-neutral-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {pipelineErrors.map((err) => (
              <div
                key={err.id}
                className={`border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  err.resolved ? 'bg-neutral-50 border-neutral-200 opacity-60' : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-neutral-900">{err.stage}</span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {err.errorType}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">{err.message}</p>
                  <p className="text-neutral-400 font-mono text-[10px]">Target: {err.target}</p>
                </div>

                {!err.resolved && (
                  <button
                    onClick={() => handleResolveError(err.id)}
                    className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
