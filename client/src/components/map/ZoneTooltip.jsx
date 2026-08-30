import React from 'react';
import { 
  FiX, 
  FiArrowUpRight, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiUsers, 
  FiMessageSquare,
  FiFileText,
  FiSliders
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';

// Zone type accent badges
const ZONE_ACCENT = {
  Commercial:   { text: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200'   },
  Residential:  { text: 'text-amber-800',   bg: 'bg-amber-50',   border: 'border-amber-200'  },
  Industrial:   { text: 'text-purple-800',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  Agricultural: { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200'},
  Heritage:     { text: 'text-cyan-800',    bg: 'bg-cyan-50',    border: 'border-cyan-200'   },
  Utility:      { text: 'text-blue-800',    bg: 'bg-blue-50',    border: 'border-blue-200'   },
  'Master Plan':{ text: 'text-neutral-800', bg: 'bg-neutral-100',border: 'border-neutral-200'},
};

export function ZoneTooltip({ zone, onClose, onQueryZone, conflicts = [] }) {
  if (!zone) return null;

  const accent = ZONE_ACCENT[zone.zone_type] || ZONE_ACCENT['Commercial'];
  const zoneConflicts = conflicts.length > 0 ? conflicts : [];

  return (
    <div className="absolute left-4 top-4 z-[1000] w-[340px] bg-white border border-neutral-200/90 rounded-3xl shadow-2xl overflow-hidden font-sans text-neutral-900 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 border-b border-neutral-100">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center space-x-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${accent.bg} ${accent.text} ${accent.border} border mb-1`}>
            <span>{zone.zone_type || 'Zone'}</span>
            {zone.zone_code && <span className="opacity-60 font-mono">• {zone.zone_code}</span>}
          </div>
          <h3 className="text-sm font-bold text-neutral-900 leading-snug">{zone.zone_name || zone.name || 'Unnamed Zone'}</h3>
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">{zone.category || ''}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 shrink-0 text-neutral-400 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Governing Authority ───────────────────────────────────── */}
      <div className="px-4 py-2 flex items-center space-x-2 bg-neutral-50/80 border-b border-neutral-100 text-xs">
        <FiUsers className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <span className="text-neutral-500 font-medium">Authority:</span>
        <span className="font-bold text-neutral-900">{zone.authority || zone.department || 'LDA'}</span>
      </div>

      {/* ── Bylaw Grid ───────────────────────────────────────────── */}
      <div className="p-4 space-y-2.5">

        {/* FAR + Max Height Row */}
        {(zone.far || zone.max_height_ft) && (
          <div className="grid grid-cols-2 gap-2">
            {zone.far && zone.far !== 'N/A' && (
              <div className="bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-2xl space-y-0.5">
                <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block">
                  Floor Area Ratio
                </span>
                <p className="text-sm font-extrabold text-neutral-900">{zone.far}</p>
              </div>
            )}
            {zone.max_height_ft && (
              <div className="bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-2xl space-y-0.5">
                <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block">
                  Max Height
                </span>
                <p className="text-sm font-extrabold text-neutral-900">{zone.max_height_ft} ft</p>
              </div>
            )}
          </div>
        )}

        {/* Setbacks */}
        {(zone.setback_front_ft || zone.setback_side_ft) && (
          <div className="space-y-1 text-xs">
            {zone.setback_front_ft && (
              <div className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200/80">
                <span className="text-neutral-500 text-[11px]">Front Setback:</span>
                <span className="font-bold text-neutral-900 text-[11px]">{zone.setback_front_ft} ft mandatory</span>
              </div>
            )}
            {zone.setback_side_ft && (
              <div className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200/80">
                <span className="text-neutral-500 text-[11px]">Side Setback:</span>
                <span className="font-bold text-neutral-900 text-[11px]">{zone.setback_side_ft} ft</span>
              </div>
            )}
          </div>
        )}

        {/* Commercialization Status */}
        {zone.commercialization_status && zone.commercialization_status !== 'None' && (
          <div className="flex items-center justify-between text-xs bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200/80">
            <span className="text-neutral-500 text-[11px]">Commercialization:</span>
            <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md ${
              zone.commercialization_status.includes('Permanent') || zone.commercialization_status.includes('List A')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {zone.commercialization_status}
            </span>
          </div>
        )}

        {/* Permitted Uses */}
        {zone.permitted_uses && zone.permitted_uses.length > 0 && (
          <div className="pt-1">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Permitted Uses:</p>
            <div className="flex flex-wrap gap-1">
              {zone.permitted_uses.map((u, idx) => (
                <span key={idx} className="bg-neutral-100 text-neutral-700 text-[10px] px-2 py-0.5 rounded-md border border-neutral-200 font-medium">
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Conflict Detection Badge ─────────────────────────────── */}
      {zoneConflicts.length > 0 && (
        <div className="mx-4 mb-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
            <FiAlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{zoneConflicts.length} Jurisdiction Conflict{zoneConflicts.length > 1 ? 's' : ''}</span>
          </div>
          {zoneConflicts.slice(0, 2).map((c, idx) => (
            <div key={idx} className="text-[10px] text-neutral-600 font-mono pl-4">
              • <strong className="text-amber-800">{c.department}:</strong> {c.conflict_type || c.message}
            </div>
          ))}
        </div>
      )}

      {/* ── Footer: Gazette + Ask RAG ────────────────────────────── */}
      <div className="px-4 pb-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 max-w-[55%] truncate font-mono">
          <RiFileTextLine className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
          <span className="truncate">{zone.gazette_reference || 'LDA Bylaws 2026'}</span>
        </div>
        <button
          onClick={() => onQueryZone && onQueryZone(zone)}
          className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <HiOutlineSparkles className="w-3.5 h-3.5" />
          <span>Ask RAG AI</span>
        </button>
      </div>
    </div>
  );
}
