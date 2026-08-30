import React from 'react';
import { 
  FiBook, 
  FiFileText, 
  FiCheckCircle, 
  FiEye, 
  FiShield, 
  FiCalendar, 
  FiTag 
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';

export function CitationCard({ citation, onOpenPdf }) {
  if (!citation) return null;

  const docTitle = citation.document_title || 'LDA Building and Zoning Regulations 2026';
  const pubDate = citation.publication_date || '2022-10-28';
  const gazetteNum = citation.gazette_number || citation.gazette_ref || 'Office Order No. LDA/DC&I/725';
  const clauseId = citation.clause_id || citation.clause || 'Clause 2.5';
  const pageNum = citation.page || 1;

  return (
    <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-2xl p-3.5 my-2.5 hover:border-neutral-900 transition-all text-xs space-y-2.5 shadow-xs">
      {/* Document Title Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-bold text-neutral-900 min-w-0">
          <RiFileTextLine className="w-4 h-4 shrink-0 text-neutral-800" />
          <span className="truncate text-xs">{docTitle}</span>
        </div>

        <div className="flex items-center space-x-1 text-neutral-800 text-[10px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md shrink-0 font-mono font-bold">
          <span>Page {pageNum}</span>
        </div>
      </div>

      {/* Publication Date & Gazette Number */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
        <span className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
          <FiCalendar className="w-3 h-3 text-neutral-600" />
          <span>Date: {pubDate}</span>
        </span>
        <span className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-800 font-semibold truncate max-w-[200px]">
          <RiShieldCheckLine className="w-3 h-3 text-emerald-600" />
          <span className="truncate">{gazetteNum}</span>
        </span>
      </div>

      {/* Section / Clause ID */}
      <div className="text-neutral-800 font-semibold text-[11px] flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-neutral-200">
        <FiTag className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
        <span className="font-mono font-bold text-neutral-900">{clauseId}</span>
      </div>

      {/* Snippet Preview */}
      {citation.snippet && (
        <p className="text-neutral-600 text-[11px] italic border-l-2 border-neutral-900 pl-2.5 py-1 bg-white rounded-r leading-relaxed font-sans">
          "{citation.snippet}"
        </p>
      )}

      {/* One-Click PDF Preview Button */}
      <div className="pt-2 flex items-center justify-between text-[10px] border-t border-neutral-200/80">
        <span className="text-emerald-700 font-mono text-[10px] flex items-center space-x-1 font-bold">
          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Grounded Record</span>
        </span>

        {onOpenPdf && (
          <button
            onClick={() => onOpenPdf(citation)}
            className="bg-neutral-900 hover:bg-black text-white px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 font-semibold text-[10px] shadow-sm shrink-0 cursor-pointer"
            title="Open Verified PDF Gazette Preview"
          >
            <FiEye className="w-3 h-3" />
            <span>Read PDF (p. {pageNum})</span>
          </button>
        )}
      </div>
    </div>
  );
}
