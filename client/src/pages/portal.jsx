import React, { useState } from 'react';
import { EntityReview } from '../components/admin/EntityReview';
import { UploadModal } from '../components/admin/UploadModal';
import { FileText, ShieldCheck, Database, History, UploadCloud, Building2, LogOut, Lock } from 'lucide-react';

export function PortalPage({ officerUser, onOfficerLogout }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Officer Isolated Navigation Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base text-white">DocuCity <span className="text-blue-400">Officer Workspace</span></h1>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 font-bold uppercase">
                Internal Restricted
              </span>
            </div>
            <p className="text-xs text-slate-400">LDA Ingestion, OCR Bylaw Extraction & Verification Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Bylaw PDF</span>
          </button>

          <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{officerUser ? officerUser.name : 'Officer Tariq Mahmood'}</p>
              <p className="text-[10px] text-blue-400 font-mono">{officerUser ? officerUser.department : 'LDA Commercial Verification'}</p>
            </div>
            <button
              onClick={onOfficerLogout}
              className="bg-slate-800 hover:bg-slate-700 text-rose-400 p-2 rounded-xl border border-slate-700 transition-all"
              title="Sign Out of Officer Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 p-6 rounded-3xl flex items-center justify-between shadow-2xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">LDA Municipal Officer Gazette Ingestion Portal</h2>
            </div>
            <p className="text-xs text-slate-400">
              Ingest LDA gazettes, run OCR extraction, inspect FAR & building height entities, and audit vector store publications.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center space-x-2"
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
            <p className="text-2xl font-extrabold text-blue-400 mt-1">182 Bylaw Clauses</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Pending Audit Reviews</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">1 Document</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] uppercase text-slate-400 font-semibold">ChromaDB Embeddings</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">1,024 Chunks</p>
          </div>
        </div>

        {/* Entity Review Portal */}
        <EntityReview />
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
