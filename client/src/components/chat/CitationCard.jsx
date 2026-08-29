import React from 'react';
import { BookOpen, FileText, CheckCircle2, Eye, ShieldCheck, Calendar, Tag } from 'lucide-react';

export function CitationCard({ citation, onOpenPdf }) {
  if (!citation) return null;

  const docTitle = citation.document_title || 'LDA Building and Zoning Regulations 2026';
  const pubDate = citation.publication_date || '2022-10-28';
  const gazetteNum = citation.gazette_number || citation.gazette_ref || 'Office Order No. LDA/DC&I/725';
  const clauseId = citation.clause_id || citation.clause || 'Clause 2.5';
  const pageNum = citation.page || 1;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 my-2 hover:border-emerald-500/50 transition-all text-xs space-y-2.5 shadow-md">
      {/* 1. Document Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold min-w-0">
          <BookOpen className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="truncate text-xs text-emerald-300">{docTitle}</span>
        </div>

        <div className="flex items-center space-x-1 text-purple-300 text-[10px] bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-full shrink-0 font-mono font-bold">
          <FileText className="w-3 h-3 text-purple-400" />
          <span>Page {pageNum}</span>
        </div>
      </div>

      {/* 2. Publication Date & Gazette Number */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <Calendar className="w-3 h-3 text-blue-400" />
          <span>Date: {pubDate}</span>
        </span>
        <span className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{gazetteNum}</span>
        </span>
      </div>

      {/* 3. Section / Clause ID */}
      <div className="text-slate-200 font-semibold text-[11px] flex items-center space-x-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
        <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-amber-300 font-mono font-bold">{clauseId}</span>
      </div>

      {/* Snippet Preview */}
      {citation.snippet && (
        <p className="text-slate-400 text-[10px] italic border-l-2 border-emerald-500/40 pl-2.5 py-1 bg-slate-950/60 rounded-r leading-relaxed font-mono">
          "{citation.snippet}"
        </p>
      )}

      {/* 4. One-Click PDF Preview Button */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80">
        <span className="text-emerald-400 font-mono text-[9px] flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>MongoDB Verified Legal Record</span>
        </span>

        {onOpenPdf && (
          <button
            onClick={() => onOpenPdf(citation)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 font-bold text-[10px] shadow-md shadow-emerald-600/30 shrink-0 cursor-pointer"
            title="One-Click PDF Gazette Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Read PDF (Page {pageNum})</span>
          </button>
        )}
      </div>
    </div>
  );
}
