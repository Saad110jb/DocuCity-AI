import React, { useState } from 'react';
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiArrowLeft, 
  FiRefreshCw, 
  FiSearch, 
  FiCheckCircle, 
  FiShield, 
  FiCpu, 
  FiClock, 
  FiLayers, 
  FiActivity,
  FiMessageSquare
} from 'react-icons/fi';
import { OfficerHeader } from '../../components/officer/OfficerHeader';
import axios from 'axios';

export function PolicyAnalyticsStudioPage({ onBack, department = 'LDA', officerUser, onOfficerLogout, setActiveView }) {
  const [data] = useState({
    heatmaps: [
      { queryId: "q-001", queryText: "Height limit in Gulberg Commercial Main Boulevard", location: "Gulberg Commercial Zone", category: "Building Codes", frequencyCount: 142, avgConfidenceScore: 0.96 },
      { queryId: "q-002", queryText: "Johar Town commercial conversion fee per kanal", location: "Johar Town Phase 2", category: "Commercialization Rules", frequencyCount: 118, avgConfidenceScore: 0.94 },
      { queryId: "q-003", queryText: "WASA Johar Town water tariff 2026", location: "Johar Town Phase 2", category: "Water Tariffs", frequencyCount: 95, avgConfidenceScore: 0.91 },
      { queryId: "q-004", queryText: "Model Town residential front setback requirements", location: "Model Town", category: "Zoning Bylaws", frequencyCount: 84, avgConfidenceScore: 0.95 },
      { queryId: "q-005", queryText: "DHA Phase 6 commercial FAR regulations", location: "DHA Lahore", category: "Commercialization Rules", frequencyCount: 76, avgConfidenceScore: 0.89 },
      { queryId: "q-006", queryText: "Walled City heritage building conservation rules", location: "Walled City of Lahore", category: "Heritage Zones", frequencyCount: 64, avgConfidenceScore: 0.87 },
      { queryId: "q-007", queryText: "LDA Avenue-1 residential plot size minimum area", location: "LDA Avenue-1", category: "Zoning Bylaws", frequencyCount: 58, avgConfidenceScore: 0.92 }
    ],
    gaps: [
      { gapId: "gap-001", queryText: "Solar rooftop installation subsidy regulations 2026", location: "All Lahore", vectorSimilarityScore: 0.42, missingRegulationSubject: "Punjab Green Energy Rooftop Solar Gazette 2026", suggestedAction: "Upload missing Punjab Energy Department circular into MongoDB Vector Search.", status: "Open Gap" },
      { gapId: "gap-002", queryText: "Ravi Riverfront Special Development Zone height caps", location: "Shahdara Town & Ravi Zone", vectorSimilarityScore: 0.51, missingRegulationSubject: "RUDA Master Plan Environmental Impact Gazette", suggestedAction: "Index RUDA Environmental Impact Notification.", status: "Under Review" },
      { gapId: "gap-003", queryText: "Electric vehicle charging bay requirements for commercial plots", location: "All Lahore Metropolitan", vectorSimilarityScore: 0.38, missingRegulationSubject: "Punjab EV Infrastructure Gazette 2025", suggestedAction: "Upload Punjab Transport Authority EV circular.", status: "Open Gap" }
    ],
    metrics: {
      activeProcessingQueues: 2,
      ocrThroughputPagesPerSec: 14.8,
      avgVectorSearchLatencyMs: 38,
      localLlmLatencySec: 1.12,
      totalQueriesAnswered: 4820,
      searchQualityAccuracy: 96.4
    }
  });

  const [activeTab, setActiveTab] = useState('heatmap');

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white">
      
      {/* Universal Officer Header */}
      <OfficerHeader
        activeView="analytics"
        setActiveView={setActiveView || (() => {})}
        assignedDepartment={department}
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
      />

      {/* Main Analytics Content */}
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

        {/* Studio Sub-Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[11px] font-bold text-neutral-800 border border-neutral-200/70">
              <FiBarChart2 className="w-3.5 h-3.5 text-neutral-800" />
              <span>{department} Policy Analytics & Query Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Policy Inquiry Analytics Studio</h2>
            <p className="text-xs text-neutral-500 max-w-2xl">
              Monitor citizen and professional inquiry heatmaps, identify unresolved bylaw gaps, and track query performance telemetry.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="p-1 bg-neutral-100 rounded-2xl border border-neutral-200 flex shrink-0">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'heatmap' ? 'bg-white text-neutral-900 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Query Heatmap
            </button>
            <button
              onClick={() => setActiveTab('gaps')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'gaps' ? 'bg-white text-neutral-900 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Policy Gaps
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Queries Answered</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{data.metrics.totalQueriesAnswered.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <FiTrendingUp className="w-3.5 h-3.5" />
              <span>+18% this week</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Vector Latency</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{data.metrics.avgVectorSearchLatencyMs} <span className="text-base font-medium text-neutral-500">ms</span></p>
            <p className="text-[11px] text-neutral-500 font-mono mt-1">ChromaDB semantic index</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Search Accuracy</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{data.metrics.searchQualityAccuracy}<span className="text-base font-medium text-neutral-500">%</span></p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Zero hallucination grounded</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">OCR Ingestion Rate</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{data.metrics.ocrThroughputPagesPerSec} <span className="text-base font-medium text-neutral-500">p/s</span></p>
            <p className="text-[11px] text-neutral-500 font-mono mt-1">Parallel Tesseract & PyMuPDF</p>
          </div>
        </div>

        {/* Data Tables */}
        {activeTab === 'heatmap' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                  <FiMessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Most Inquired Policy Topics</h3>
                  <p className="text-xs text-neutral-400">Citizen & architect questions indexed across all Lahore sectors</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-neutral-100 px-2.5 py-1 rounded-lg text-neutral-600 border border-neutral-200">
                {data.heatmaps.length} Queries
              </span>
            </div>

            <div className="divide-y divide-neutral-100">
              {data.heatmaps.map((item) => (
                <div key={item.queryId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-sm text-neutral-900">{item.queryText}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-neutral-400">{item.location}</span>
                      <span className="text-[11px] text-neutral-300">•</span>
                      <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    {/* Visual frequency bar */}
                    <div className="hidden sm:flex items-center space-x-2">
                      <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full"
                          style={{ width: `${Math.round((item.frequencyCount / 150) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="bg-neutral-100 border border-neutral-200 font-bold px-2.5 py-1 rounded-lg text-neutral-800 font-mono text-xs">
                      {item.frequencyCount} queries
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {(item.avgConfidenceScore * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                  <FiAlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Identified Bylaw Coverage Gaps</h3>
                  <p className="text-xs text-neutral-400">Questions where no matching official gazette clause was found in vector DB</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-50 px-2.5 py-1 rounded-lg text-amber-800 border border-amber-200">
                {data.gaps.length} Open Gaps
              </span>
            </div>

            <div className="space-y-4">
              {data.gaps.map((gap) => (
                <div key={gap.gapId} className="bg-neutral-50 border border-neutral-200/80 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-sm text-neutral-900">{gap.queryText}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">{gap.location}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      gap.status === 'Open Gap'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {gap.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Missing Regulation</p>
                      <p className="font-semibold text-neutral-900">{gap.missingRegulationSubject}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Recommended Action</p>
                      <p className="font-semibold text-neutral-900">{gap.suggestedAction}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-neutral-400">Vector Similarity Score:</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${gap.vectorSimilarityScore * 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-rose-600">{(gap.vectorSimilarityScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
