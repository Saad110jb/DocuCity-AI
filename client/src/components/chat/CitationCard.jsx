import React from 'react';
import { BookOpen, FileText, CheckCircle2, Eye, ShieldCheck } from 'lucide-react';

export function CitationCard({ citation, onOpenPdf }) {
  if (!citation) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 my-2 hover:border-emerald-500/50 transition-all text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold min-w-0">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{citation.document_title}</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
          <FileText className="w-3 h-3 text-slate-400" />
          <span>Page {citation.page || 1}</span>
        </div>
      </div>

      <div className="text-slate-300 font-medium text-[11px]">
        {citation.clause}
      </div>

      {citation.snippet && (
        <p className="text-slate-400 text-[10px] italic border-l-2 border-emerald-500/40 pl-2 py-0.5 bg-slate-950/40 rounded-r">
          "{citation.snippet}"
        </p>
      )}

      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80">
        <div className="flex items-center space-x-1 text-slate-400 truncate max-w-[170px]">
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{citation.gazette_ref || 'Punjab Gazette'}</span>
        </div>

        {onOpenPdf && (
          <button
            onClick={() => onOpenPdf(citation)}
            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-500/40 transition-all flex items-center space-x-1 font-bold text-[10px] shadow-sm shrink-0"
            title="One-Click PDF Gazette Preview"
          >
            <Eye className="w-3 h-3" />
            <span>Verify PDF</span>
          </button>
        )}
      </div>
    </div>
  );
}
