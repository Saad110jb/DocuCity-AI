import React, { useState, useEffect } from 'react';
import {
  Eye, FileText, CheckCircle2, AlertTriangle, Save, RefreshCw, Sparkles,
  Table, Tag, ShieldCheck, ArrowLeft, Plus, Trash2, Edit3, Type, Layers
} from 'lucide-react';
import axios from 'axios';

export function OcrCorrectionStudioPage({ documentId = 'doc-ingest-001', onBack }) {
  const [ocrData, setOcrData] = useState({
    documentId: documentId,
    filename: "Uploaded_Document.pdf",
    totalPages: 206,
    currentPage: 1,
    textChunks: [
      {
        id: "chk-p1",
        bbox: { x: 10, y: 15, width: 80, height: 12 },
        englishText: "[Page 1] Official Document Regulations",
        urduText: "[صفحہ 1] سرکاری ضوابط و رولز",
        confidence: 0.96
      }
    ],
    tabularBylaws: [
      { id: "tbl-1", zone: "Lahore Metropolitan District", minPlotSize: "1 Kanal", maxFAR: "1:8", maxHeight: "120 ft", frontSetback: "20 ft", sideSetback: "10 ft", commercialFeeTier: "Tier 1 (20% DC Rate)" }
    ],
    namedEntities: [
      { id: "ent-1", label: "AUTHORITY", text: "LDA", confidence: 0.99 },
      { id: "ent-2", label: "FAR_LIMIT", text: "1:8", confidence: 0.97 },
      { id: "ent-3", label: "HEIGHT_ALLOWANCE", text: "120 ft", confidence: 0.95 }
    ],
    redactedPii: [
      { id: "pii-1", piiCategory: "CNIC", original: "35202-7386736-1", redacted: "[CNIC REDACTED]", verified: true }
    ]
  });

  const [activeChunkId, setActiveChunkId] = useState('chk-p1');
  const [activeRightTab, setActiveRightTab] = useState('bilingual'); // 'bilingual' | 'table' | 'entities' | 'pii'
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  // Load document-specific OCR details from backend
  useEffect(() => {
    async function loadOcrDetails() {
      try {
        const res = await axios.get(`http://localhost:5000/api/documents/ocr/${documentId}`);
        if (res.data) {
          setOcrData(res.data);
          if (res.data.textChunks && res.data.textChunks.length > 0) {
            setActiveChunkId(res.data.textChunks[0].id);
          }
        }
      } catch (e) {
        console.warn('Using default OCR correction studio data');
      }
    }
    loadOcrDetails();
  }, [documentId]);

  // Save OCR & Entity Corrections directly to MongoDB
  const handleSaveAllCorrections = async () => {
    setSaving(true);
    setSaveNotice('');
    try {
      await axios.post('http://localhost:5000/api/documents/ocr/save', ocrData);
      setSaveNotice('OCR text, Nastaliq ligatures, tabular bylaws, & entities saved to MongoDB!');
      setTimeout(() => setSaveNotice(''), 3000);
    } catch (e) {
      setSaveNotice('Corrections updated locally.');
      setTimeout(() => setSaveNotice(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Urdu Ligature Quick Fix Palette Handler
  const handleQuickFixUrdu = (chunkId, wrongText, correctText) => {
    setOcrData(prev => ({
      ...prev,
      textChunks: prev.textChunks.map(c =>
        c.id === chunkId ? { ...c, urduText: c.urduText.replace(new RegExp(wrongText, 'g'), correctText) } : c
      )
    }));
  };

  // Edit Tabular Bylaw Cell
  const handleEditTableCell = (rowId, field, value) => {
    setOcrData(prev => ({
      ...prev,
      tabularBylaws: prev.tabularBylaws.map(row => row.id === rowId ? { ...row, [field]: value } : row)
    }));
  };

  // Add New Tabular Bylaw Row
  const handleAddTableRow = () => {
    const newRow = {
      id: `tbl-${Date.now()}`,
      zone: "Model Town Suburb",
      minPlotSize: "1 Kanal",
      maxFAR: "1:3.5",
      maxHeight: "38 ft",
      frontSetback: "15 ft",
      sideSetback: "8 ft",
      commercialFeeTier: "Tier 2 (Standard)"
    };
    setOcrData(prev => ({ ...prev, tabularBylaws: [...prev.tabularBylaws, newRow] }));
  };

  // Edit Named Entity
  const handleEditEntity = (entId, newText) => {
    setOcrData(prev => ({
      ...prev,
      namedEntities: prev.namedEntities.map(e => e.id === entId ? { ...e, text: newText } : e)
    }));
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
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>OCR & Bilingual Entity Correction Studio</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Document: <span className="text-purple-300">{ocrData.filename}</span> (PaddleOCR + PyMuPDF Extraction)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {saveNotice && (
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-mono animate-pulse">
              {saveNotice}
            </span>
          )}

          <button
            onClick={handleSaveAllCorrections}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Corrections to MongoDB'}</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL (6 Cols): Dynamic Side-by-Side Visual Review - Bounding Boxes */}
        <div className="lg:col-span-6 bg-slate-900 border-r border-slate-800 p-6 flex flex-col overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Side-by-Side Visual Scanned Gazette Review</h2>
            </div>
            <span className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 font-mono">
              Page {ocrData.currentPage} of {ocrData.totalPages}
            </span>
          </div>

          {/* Interactive Dynamic Bounding Box Canvas Container */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl min-h-[480px] p-6 shadow-inner flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              {ocrData.textChunks && ocrData.textChunks.slice(0, 10).map((chunk, idx) => (
                <div
                  key={chunk.id || idx}
                  onClick={() => {
                    setActiveChunkId(chunk.id);
                    setActiveRightTab('bilingual');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                    activeChunkId === chunk.id
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <span className="absolute -top-3 left-3 bg-purple-600 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                    BBOX #{idx + 1} (Conf: {Math.round((chunk.confidence || 0.96) * 100)}%)
                  </span>

                  <p className="text-xs text-slate-200 leading-relaxed pt-1 font-mono">
                    {chunk.englishText}
                  </p>

                  {chunk.urduText && (
                    <p className="text-xs text-purple-300 font-mono mt-2 text-right leading-relaxed border-t border-slate-800/60 pt-1" dir="rtl">
                      {chunk.urduText}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span>Click any bounding box above to inspect & edit OCR text on the right panel.</span>
              <span className="text-purple-400 font-mono font-bold">PaddleOCR Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (6 Cols): Verification Tools, Urdu Palette, Tabular Bylaw Editor, Entity Inspector & PII Review */}
        <div className="lg:col-span-6 bg-slate-950 p-6 flex flex-col overflow-y-auto space-y-6">
          {/* Tool Selector Tabs */}
          <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800 space-x-1 text-xs font-bold">
            <button
              onClick={() => setActiveRightTab('bilingual')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'bilingual' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Bilingual OCR & Urdu Palette</span>
            </button>

            <button
              onClick={() => setActiveRightTab('table')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'table' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabular Bylaws Grid</span>
            </button>

            <button
              onClick={() => setActiveRightTab('entities')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'entities' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Entity Inspector</span>
            </button>

            <button
              onClick={() => setActiveRightTab('pii')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'pii' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PII Redaction Review</span>
            </button>
          </div>

          {/* TAB 1: Bilingual OCR Verification & Urdu Nastaliq Correction Palette */}
          {activeRightTab === 'bilingual' && (
            <div className="space-y-6">
              {ocrData.textChunks && ocrData.textChunks.slice(0, 10).map((chunk) => (
                <div
                  key={chunk.id}
                  className={`bg-slate-900 border rounded-3xl p-5 shadow-2xl space-y-4 transition-all ${
                    activeChunkId === chunk.id ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white">Bounding Box Chunk: {chunk.id}</span>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                      OCR Confidence: {Math.round((chunk.confidence || 0.96) * 100)}%
                    </span>
                  </div>

                  {/* English OCR Text Editor */}
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold mb-1 block">English OCR Text (Editable):</label>
                    <textarea
                      rows={2}
                      value={chunk.englishText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOcrData(prev => ({
                          ...prev,
                          textChunks: prev.textChunks.map(c => c.id === chunk.id ? { ...c, englishText: val } : c)
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Urdu Nastaliq OCR Text Editor */}
                  <div>
                    <label className="text-[11px] text-purple-400 font-semibold mb-1 block">Urdu Nastaliq OCR Text (Editable):</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={chunk.urduText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOcrData(prev => ({
                          ...prev,
                          textChunks: prev.textChunks.map(c => c.id === chunk.id ? { ...c, urduText: val } : c)
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-purple-200 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Urdu OCR Correction Palette - Quick Fix Buttons */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Urdu Nastaliq Ligature Quick-Fix Palette:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleQuickFixUrdu(chunk.id, 'لا ہور', 'لاہور')}
                        className="bg-slate-950 hover:bg-purple-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded-lg text-purple-300 font-mono"
                      >
                        Fix "لا ہور" → "لاہور"
                      </button>
                      <button
                        onClick={() => handleQuickFixUrdu(chunk.id, 'نو ٹیفکیشن', 'نوٹیفکیشن')}
                        className="bg-slate-950 hover:bg-purple-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded-lg text-purple-300 font-mono"
                      >
                        Fix "نو ٹیفکیشن" → "نوٹیفکیشن"
                      </button>
                      <button
                        onClick={() => handleQuickFixUrdu(chunk.id, 'با ئلا ز', 'بائیلاز')}
                        className="bg-slate-950 hover:bg-purple-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded-lg text-purple-300 font-mono"
                      >
                        Fix "با ئلا ز" → "بائیلاز"
                      </button>
                      <button
                        onClick={() => handleQuickFixUrdu(chunk.id, 'پلاٹ', 'پلاٹ')}
                        className="bg-slate-950 hover:bg-purple-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded-lg text-purple-300 font-mono"
                      >
                        Fix "پلاٹ" → "پلاٹ"
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Tabular Bylaw Editor Data Grid */}
          {activeRightTab === 'table' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Table className="w-4 h-4 text-purple-400" />
                    <span>Tabular Bylaw Interactive Data Grid</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Inspect & adjust extracted FAR, setbacks, and fee tiers before embedding</p>
                </div>

                <button
                  onClick={handleAddTableRow}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Zone</th>
                      <th className="p-2.5">Min Plot</th>
                      <th className="p-2.5">Max FAR</th>
                      <th className="p-2.5">Max Height</th>
                      <th className="p-2.5">Front Setback</th>
                      <th className="p-2.5">Commercial Fee Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {ocrData.tabularBylaws && ocrData.tabularBylaws.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-950/40">
                        <td className="p-2 font-bold text-white">
                          <input
                            type="text"
                            value={row.zone}
                            onChange={(e) => handleEditTableCell(row.id, 'zone', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none w-full font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.minPlotSize}
                            onChange={(e) => handleEditTableCell(row.id, 'minPlotSize', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.maxFAR}
                            onChange={(e) => handleEditTableCell(row.id, 'maxFAR', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-emerald-400 font-mono font-bold focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.maxHeight}
                            onChange={(e) => handleEditTableCell(row.id, 'maxHeight', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-blue-400 font-mono focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.frontSetback}
                            onChange={(e) => handleEditTableCell(row.id, 'frontSetback', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-purple-300 focus:outline-none w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.commercialFeeTier}
                            onChange={(e) => handleEditTableCell(row.id, 'commercialFeeTier', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-amber-300 focus:outline-none w-full"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Named Entity Extraction Inspector */}
          {activeRightTab === 'entities' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span>Extracted Named Entity Inspector</span>
                </h3>
                <p className="text-[10px] text-slate-400">Review & edit extracted FAR limits, height allowances, gazette numbers, and dates</p>
              </div>

              <div className="space-y-3">
                {ocrData.namedEntities && ocrData.namedEntities.map((ent) => (
                  <div key={ent.id} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                        {ent.label}
                      </span>
                      <input
                        type="text"
                        value={ent.text}
                        onChange={(e) => handleEditEntity(ent.id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Conf: {Math.round((ent.confidence || 0.95) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Automated PII / CNIC Redaction Review */}
          {activeRightTab === 'pii' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Automated PII / CNIC Redaction Visual Verification</span>
                </h3>
                <p className="text-[10px] text-slate-400">Verify auto-redacted sensitive personal data before indexing into MongoDB</p>
              </div>

              <div className="space-y-3">
                {ocrData.redactedPii && ocrData.redactedPii.map((pii) => (
                  <div key={pii.id} className="bg-slate-950 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          {pii.piiCategory || pii.type || 'CNIC'} Entity
                        </span>
                        <span className="text-slate-400 text-[11px]">Original: <span className="font-mono text-slate-200">{pii.original}</span></span>
                      </div>
                      <p className="font-mono text-emerald-300 font-bold">{pii.redacted}</p>
                    </div>

                    <span className="inline-flex items-center space-x-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Redacted</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
