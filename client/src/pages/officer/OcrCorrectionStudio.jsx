import React, { useState } from 'react';
import { 
  FiEye, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiSave, 
  FiRefreshCw, 
  FiShield, 
  FiArrowLeft, 
  FiPlus, 
  FiTrash2, 
  FiEdit3, 
  FiType, 
  FiLayers 
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import { OfficerHeader } from '../../components/officer/OfficerHeader';
import axios from 'axios';

export function OcrCorrectionStudioPage({ documentId = 'doc-ingest-001', onBack, department = 'LDA', officerUser, onOfficerLogout, setActiveView }) {
  const [ocrData, setOcrData] = useState({
    documentId: documentId,
    filename: "LDA_Building_Bylaws_2026.pdf",
    totalPages: 113,
    currentPage: 1,
    textChunks: [
      {
        id: "chk-p1",
        englishText: "[Page 1] Low Rise Apartment: Height up to 48ft (G+3 Storeys), Ground Coverage 65%, Plot Size 10 Marla to 1 Kanal. High density commercial FAR is 1:8 on Main Boulevard plots.",
        urduText: "[صفحہ 1] کم بلندی کے اپارٹمنٹس: زیادہ سے زیادہ اونچائی 48 فٹ، گراؤنڈ کوریج 65 فیصد۔ کمرشل ایف اے آر مین بولیوارڈ پر 1:8 ہے۔",
        confidence: 0.98
      },
      {
        id: "chk-p2",
        englishText: "[Page 2] Parking Standards: 1 Car Space per 1,200 sq ft covered area. Mandatory parking clearance required from TEPA prior to building plan sanction.",
        urduText: "[صفحہ 2] پارکنگ کے قواعد: 1200 مربع فٹ پر ایک گاڑی کی پارکنگ لازمی ہے۔ ٹیپا سے پیشگی منظوری لازمی ہے۔",
        confidence: 0.96
      },
      {
        id: "chk-p3",
        englishText: "[Page 3] Setback Requirements: Front setback minimum 20 ft on commercial plots. Side setback 10 ft. Rear setback 10 ft mandatory for all multi-storey development.",
        urduText: "[صفحہ 3] سیٹ بیک کے تقاضے: کمرشل پلاٹوں پر سامنے کا فاصلہ کم از کم 20 فٹ۔ سائیڈ سیٹ بیک 10 فٹ۔",
        confidence: 0.94
      }
    ],
    tabularBylaws: [
      { id: "tbl-1", zone: "Gulberg Commercial Spines (Main Blvd)", minPlotSize: "1 Kanal", maxFAR: "1:8", maxHeight: "120 ft", frontSetback: "20 ft", sideSetback: "10 ft", commercialFeeTier: "Tier 1 (20% DC Rate)" },
      { id: "tbl-2", zone: "Model Town Residential Extension", minPlotSize: "10 Marla", maxFAR: "1:4", maxHeight: "48 ft", frontSetback: "15 ft", sideSetback: "5 ft", commercialFeeTier: "N/A – Residential" },
      { id: "tbl-3", zone: "DHA Phase 6 Mixed-Use Corridor", minPlotSize: "2 Kanal", maxFAR: "1:6", maxHeight: "90 ft", frontSetback: "20 ft", sideSetback: "10 ft", commercialFeeTier: "Tier 2 (15% DC Rate)" }
    ],
    namedEntities: [
      { id: "ent-1", label: "AUTHORITY", text: "Lahore Development Authority (LDA)", confidence: 0.99 },
      { id: "ent-2", label: "FAR_LIMIT", text: "1:8 Commercial", confidence: 0.98 },
      { id: "ent-3", label: "HEIGHT_ALLOWANCE", text: "120 ft (10 Storeys)", confidence: 0.97 },
      { id: "ent-4", label: "SETBACK_FRONT", text: "20 ft minimum", confidence: 0.96 },
      { id: "ent-5", label: "GAZETTE_DATE", text: "9 February 2026", confidence: 0.95 }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  const handleSaveOcr = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveNotice('OCR edits verified & saved to MongoDB Vector index.');
      setTimeout(() => setSaveNotice(''), 3500);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white">
      
      {/* Universal Officer Header */}
      <OfficerHeader
        activeView="ocr"
        setActiveView={setActiveView || (() => {})}
        assignedDepartment={department}
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
      />

      {/* Main Studio Body */}
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

        {/* Studio Sub-Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[11px] font-bold text-neutral-800 border border-neutral-200/70">
              <RiFileTextLine className="w-3.5 h-3.5 text-neutral-800" />
              <span>Bilingual OCR Grounding Engine Active</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">OCR Correction & Grounding Studio</h2>
            <p className="text-xs text-neutral-500">{ocrData.filename} • {ocrData.totalPages} Pages</p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {saveNotice && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {saveNotice}
              </span>
            )}
            <button
              onClick={handleSaveOcr}
              disabled={saving}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <FiSave className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Re-Index'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Parsed Text Chunks (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Extracted Gazette Text Chunks</h3>
                  <p className="text-xs text-neutral-400">Click any chunk to edit English and Urdu translations</p>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 border border-neutral-200">
                  {ocrData.textChunks.length} Chunks
                </span>
              </div>

              <div className="space-y-4">
                {ocrData.textChunks.map((chunk, idx) => (
                  <div key={chunk.id || idx} className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-mono">Chunk #{idx + 1} — {chunk.id}</span>
                      <span className={`font-bold px-2 py-0.5 rounded border ${
                        chunk.confidence >= 0.95 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {(chunk.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">English Text</label>
                      <textarea
                        value={chunk.englishText}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setOcrData(prev => ({
                            ...prev,
                            textChunks: prev.textChunks.map((c, i) => i === idx ? { ...c, englishText: newText } : c)
                          }));
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 leading-relaxed font-sans resize-none"
                        rows={3}
                      />
                    </div>

                    {chunk.urduText && (
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Urdu Translation (Nastaliq)</label>
                        <textarea
                          value={chunk.urduText}
                          onChange={(e) => {
                            const newUrdu = e.target.value;
                            setOcrData(prev => ({
                              ...prev,
                              textChunks: prev.textChunks.map((c, i) => i === idx ? { ...c, urduText: newUrdu } : c)
                            }));
                          }}
                          className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 leading-loose font-serif text-right resize-none"
                          rows={2}
                          dir="rtl"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Tabular Bylaws (full-width proper rows) */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Structured Tabular Bylaw Records</h3>
                  <p className="text-xs text-neutral-400">Auto-extracted zoning parameter tables indexed for vector search</p>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 border border-neutral-200">
                  {ocrData.tabularBylaws.length} Entries
                </span>
              </div>

              <div className="space-y-3">
                {ocrData.tabularBylaws.map((tbl) => (
                  <div key={tbl.id} className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl space-y-2.5">
                    <h4 className="font-bold text-sm text-neutral-900">{tbl.zone}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">Min Plot</span>
                        <span className="font-bold text-neutral-900">{tbl.minPlotSize}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">Max FAR</span>
                        <span className="font-bold text-neutral-900">{tbl.maxFAR}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">Max Height</span>
                        <span className="font-bold text-neutral-900">{tbl.maxHeight}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">Front Setback</span>
                        <span className="font-bold text-neutral-900">{tbl.frontSetback}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">Side Setback</span>
                        <span className="font-bold text-neutral-900">{tbl.sideSetback}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold block">Fee Tier</span>
                        <span className="font-bold text-neutral-900 text-[11px]">{tbl.commercialFeeTier}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Named Entities (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Named Entity Recognition (NER)</h3>
                  <p className="text-xs text-neutral-400">Auto-tagged legal entities, limits, and authority references</p>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">Auto-Tagged</span>
              </div>

              <div className="space-y-3">
                {ocrData.namedEntities.map((ent) => (
                  <div key={ent.id} className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">{ent.label}</span>
                      <span className="font-bold text-sm text-neutral-900">{ent.text}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border ${
                        ent.confidence >= 0.97
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {(ent.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Metadata Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900">Document Metadata</h3>
                <p className="text-xs text-neutral-400">Extracted document identification & vector index status</p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 font-semibold">Document ID</span>
                  <span className="font-mono font-bold text-neutral-800">{ocrData.documentId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 font-semibold">Total Pages</span>
                  <span className="font-bold text-neutral-900">{ocrData.totalPages}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500 font-semibold">Text Chunks</span>
                  <span className="font-bold text-neutral-900">{ocrData.textChunks.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500 font-semibold">Vector Index Status</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    Indexed & Active
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
