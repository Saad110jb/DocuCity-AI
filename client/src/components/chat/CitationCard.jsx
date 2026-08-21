import React from 'react';
import { BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export function CitationCard({ citation }) {
  if (!citation) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 my-2 hover:border-emerald-500/50 transition-all text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{citation.document_title}</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded-full">
          <FileText className="w-3 h-3 text-slate-400" />
          <span>Page {citation.page}</span>
        </div>
      </div>

      <div className="text-slate-300 font-medium text-[11px] mb-1">
        {citation.clause}
      </div>

      <p className="text-slate-400 text-[10px] italic border-l-2 border-emerald-500/40 pl-2 py-0.5 bg-slate-950/40 rounded-r">
        "{citation.snippet}"
      </p>

      {citation.gazette_ref && (
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
          <span>Ref: {citation.gazette_ref}</span>
          <span className="flex items-center text-emerald-400 space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified Gazette Clause</span>
          </span>
        </div>
      )}
    </div>
  );
}
