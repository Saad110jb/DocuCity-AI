import React, { useState, useEffect } from 'react';
import {
  BarChart3, Flame, AlertCircle, MessageSquare, Zap, ArrowLeft, RefreshCw,
  Search, CheckCircle2, ShieldAlert, Cpu, Clock, HelpCircle, Layers, Check, X
} from 'lucide-react';
import axios from 'axios';

export function PolicyAnalyticsStudioPage({ onBack, department = 'LDA' }) {
  const [data, setData] = useState({
    heatmaps: [
      { queryId: "q-001", queryText: "Height limit in Gulberg Commercial Main Boulevard", location: "Gulberg Commercial Zone", category: "Building Codes", frequencyCount: 142, avgConfidenceScore: 0.96 },
      { queryId: "q-002", queryText: "Johar Town commercial conversion fee per kanal", location: "Johar Town Phase 2", category: "Commercialization Rules", frequencyCount: 118, avgConfidenceScore: 0.94 },
      { queryId: "q-003", queryText: "WASA Johar Town water tariff 2026", location: "Johar Town Phase 2", category: "Water Tariffs", frequencyCount: 95, avgConfidenceScore: 0.91 },
      { queryId: "q-004", queryText: "Model Town residential front setback requirements", location: "Model Town", category: "Zoning Bylaws", frequencyCount: 84, avgConfidenceScore: 0.95 },
      { queryId: "q-005", queryText: "DHA Phase 6 commercial FAR regulations", location: "DHA Lahore", category: "Commercialization Rules", frequencyCount: 76, avgConfidenceScore: 0.89 }
    ],
    gaps: [
      { gapId: "gap-001", queryText: "Solar rooftop installation subsidy regulations 2026", location: "All Lahore", vectorSimilarityScore: 0.42, missingRegulationSubject: "Punjab Green Energy Rooftop Solar Gazette 2026", suggestedAction: "Upload missing Punjab Energy Department circular into MongoDB Vector Search.", status: "Open Gap" },
      { gapId: "gap-002", queryText: "Ravi Riverfront Special Development Zone building height caps", location: "Shahdara Town & Ravi Zone", vectorSimilarityScore: 0.51, missingRegulationSubject: "RUDA Master Plan Environmental Impact Gazette", suggestedAction: "Index RUDA Environmental Impact Notification.", status: "Under Officer Review" }
    ],
    disputes: [
      {
        disputeId: "disp-001",
        submittedBy: { name: "Architect Haroon Rasheed", role: "Registered PCATP Architect", email: "haroon@architects.pk" },
        disputedDocumentTitle: "LDA Commercial Bylaws 1998 Clause 4.2",
        disputedClause: "FAR 1:4 Commercial Limit",
        feedbackMessage: "The 1998 clause is cited in public chat, but LDA 2026 Gazette Amendment increased allowed FAR to 1:8 on Main Boulevard plots.",
        resolutionStatus: "Pending Officer Review",
        submittedAt: "2026-08-25T14:30:00Z"
      },
      {
        disputeId: "disp-002",
        submittedBy: { name: "Engineer Usman Malik", role: "Structural Consultant", email: "usman@civilengineers.org" },
        disputedDocumentTitle: "WASA Sewerage Clearance Certificate Guidelines",
        disputedClause: "Clause 12 - High Rise Connection Fees",
        feedbackMessage: "Citation links to 2020 fee structure instead of updated 2026 WASA Tariff Circular.",
        resolutionStatus: "Pending Officer Review",
        submittedAt: "2026-08-24T09:15:00Z"
      }
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

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'gaps' | 'disputes' | 'telemetry'

  // Load analytics overview from backend
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/security/analytics');
      if (res.data) setData(res.data);
    } catch (e) {
      console.warn('Using default analytics overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Update Search Gap Status
  const handleResolveGap = async (gapId, status) => {
    setData(prev => ({
      ...prev,
      gaps: prev.gaps.map(g => g.gapId === gapId ? { ...g, status } : g)
    }));

    try {
      await axios.put(`http://localhost:5000/api/security/analytics/gaps/${gapId}`, { status });
    } catch (e) {}
  };

  // Resolve Citation Dispute Status
  const handleResolveDispute = async (disputeId, resolutionStatus) => {
    setData(prev => ({
      ...prev,
      disputes: prev.disputes.map(d => d.disputeId === disputeId ? { ...d, resolutionStatus } : d)
    }));

    try {
      await axios.put(`http://localhost:5000/api/security/analytics/disputes/${disputeId}`, { resolutionStatus });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between z-10 backdrop-blur-md shrink-0">
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
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Policy Analytics & Public Query Insights</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Public Inquiries Heatmap • Search Gap Alerts • Citation Dispute Queue • Real-Time Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAnalytics}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            {department} Analytics Scope
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {/* Real-time Telemetry Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Public Inquiries</span>
            <p className="text-xl font-extrabold text-white font-mono">{data.metrics.totalQueriesAnswered.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-400 font-bold">+14% this week</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Vector Search Latency</span>
            <p className="text-xl font-extrabold text-emerald-400 font-mono">{data.metrics.avgVectorSearchLatencyMs} ms</p>
            <p className="text-[10px] text-slate-400">MongoDB Vector Index</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">OCR Pipeline Throughput</span>
            <p className="text-xl font-extrabold text-purple-400 font-mono">{data.metrics.ocrThroughputPagesPerSec} p/s</p>
            <p className="text-[10px] text-purple-300">PaddleOCR Active</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Local LLM Latency</span>
            <p className="text-xl font-extrabold text-blue-400 font-mono">{data.metrics.localLlmLatencySec} s</p>
            <p className="text-[10px] text-blue-300">Qwen2.5-7B Ollama</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">RAG Accuracy Score</span>
            <p className="text-xl font-extrabold text-cyan-400 font-mono">{data.metrics.searchQualityAccuracy}%</p>
            <p className="text-[10px] text-cyan-300">High Confidence</p>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800 space-x-1 text-xs font-bold w-full md:w-auto inline-flex">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'heatmap' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Public Inquiries Heatmap ({data.heatmaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'gaps' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Search Gap Alerts ({data.gaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'disputes' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Citation Dispute Queue ({data.disputes.length})</span>
          </button>
        </div>

        {/* TAB 1: Public Inquiries Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Frequently Queried Topics & Location Distribution</span>
                </h2>
                <p className="text-xs text-slate-400">Real-time public query volume across Lahore development zones & gazette subjects</p>
              </div>

              <span className="text-xs bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-mono font-bold">
                HOTSPOT_ANALYTICS
              </span>
            </div>

            <div className="space-y-4">
              {data.heatmaps.map((item, idx) => (
                <div key={item.queryId} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-white">{item.queryText}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Location: <span className="text-blue-400 font-semibold">{item.location}</span> • Category: <span className="text-purple-300">{item.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-amber-400 font-mono">{item.frequencyCount}</span>
                        <span className="text-[10px] text-slate-500 block uppercase">Inquiries</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-emerald-400 font-bold">{Math.round(item.avgConfidenceScore * 100)}%</span>
                        <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
                      </div>
                    </div>
                  </div>

                  {/* Frequency Visual Progress Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (item.frequencyCount / 150) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Search Gap & Low-Confidence Alerts */}
        {activeTab === 'gaps' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>Search Gap & Low-Confidence Alerts</span>
                </h2>
                <p className="text-xs text-slate-400">Identifies citizen queries with low similarity scores in vector search (highlighting unindexed gazettes)</p>
              </div>

              <span className="text-xs bg-rose-500/10 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30 font-mono font-bold">
                SIMILARITY_SCORE &lt; 0.65
              </span>
            </div>

            <div className="space-y-4">
              {data.gaps.map((gap) => (
                <div key={gap.gapId} className="bg-slate-950 border border-rose-500/30 p-5 rounded-2xl space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        SIMILARITY: {gap.vectorSimilarityScore}
                      </span>
                      <h3 className="text-xs font-bold text-white">Query: "{gap.queryText}"</h3>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-xl font-bold border ${
                      gap.status === 'Resolved & Indexed'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {gap.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-300">
                      <span className="text-slate-500 font-semibold">Missing Regulation Target:</span> <span className="text-purple-300 font-semibold">{gap.missingRegulationSubject}</span>
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Suggested Action:</span> {gap.suggestedAction}
                    </p>
                  </div>

                  {/* Resolution Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleResolveGap(gap.gapId, 'Under Officer Review')}
                      className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all"
                    >
                      Mark Under Officer Review
                    </button>

                    <button
                      onClick={() => handleResolveGap(gap.gapId, 'Resolved & Indexed')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve & Mark Indexed</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Citizen Feedback & Citation Dispute Queue */}
        {activeTab === 'disputes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <span>Citizen Feedback & Citation Dispute Queue</span>
                </h2>
                <p className="text-xs text-slate-400">Review feedback submitted by architects, engineers, and citizens regarding conflicting clauses</p>
              </div>

              <span className="text-xs bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-mono font-bold">
                CITATION_AUDIT_QUEUE
              </span>
            </div>

            <div className="space-y-4">
              {data.disputes.map((dispute) => (
                <div key={dispute.disputeId} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-white">{dispute.disputedDocumentTitle}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Clause Target: <span className="text-purple-300 font-semibold">{dispute.disputedClause}</span> • Submitted by <span className="text-blue-400 font-bold">{dispute.submittedBy.name}</span> ({dispute.submittedBy.role})
                      </p>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-xl font-bold border ${
                      dispute.resolutionStatus === 'Clause Updated'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {dispute.resolutionStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-mono">
                    "{dispute.feedbackMessage}"
                  </p>

                  {/* Resolution Action Controls */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleResolveDispute(dispute.disputeId, 'Clause Updated')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Update Citation</span>
                    </button>

                    <button
                      onClick={() => handleResolveDispute(dispute.disputeId, 'Escalated to Legal Wing')}
                      className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-500/30 transition-all"
                    >
                      Escalate to Legal Wing
                    </button>

                    <button
                      onClick={() => handleResolveDispute(dispute.disputeId, 'Dispute Rejected')}
                      className="bg-rose-950 hover:bg-rose-900 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-800 transition-all"
                    >
                      Reject Dispute
                    </button>
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
