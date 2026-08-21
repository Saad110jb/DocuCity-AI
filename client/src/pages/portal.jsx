import React, { useState } from 'react';
import { EntityReview } from '../components/admin/EntityReview';
import { UploadModal } from '../components/admin/UploadModal';
import { FileText, ShieldCheck, Database, History, UploadCloud } from 'lucide-react';

export function PortalPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8 bg-slate-950 text-slate-100 overflow-y-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">LDA Municipal Officer Gazette Portal</h1>
          </div>
          <p className="text-xs text-slate-400">
            Ingest LDA gazettes, run OCR extraction, inspect FAR & building height entities, and audit vector store publications.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center space-x-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Gazette PDF</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] uppercase text-slate-400 font-semibold">Indexed Documents</p>
          <p className="text-2xl font-extrabold text-white mt-1">14 Gazette PDFs</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] uppercase text-slate-400 font-semibold">Extracted Entities</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">182 Bylaw Clauses</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] uppercase text-slate-400 font-semibold">Pending Audit Reviews</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">1 Document</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] uppercase text-slate-400 font-semibold">ChromaDB Embeddings</p>
          <p className="text-2xl font-extrabold text-blue-400 mt-1">1,024 Chunks</p>
        </div>
      </div>

      {/* Entity Review Portal */}
      <EntityReview />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
