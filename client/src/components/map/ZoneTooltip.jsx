import React from 'react';
import {
  X, Ruler, ArrowUpRight, FileCheck, Building2, ShieldCheck,
  AlertTriangle, Users, Banknote, CheckCircle2, MessageSquare
} from 'lucide-react';

// Zone type accent colours (matches GeoJsonLayer palette)
const ZONE_ACCENT = {
  Commercial:   { text: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/40'   },
  Residential:  { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40'},
  Industrial:   { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40'},
  Agricultural: { text: 'text-emerald-400',bg: 'bg-emerald-500/20',border: 'border-emerald-500/40'},
  Heritage:     { text: 'text-cyan-400',   bg: 'bg-cyan-500/20',   border: 'border-cyan-500/40'  },
  Utility:      { text: 'text-cyan-400',   bg: 'bg-cyan-500/20',   border: 'border-cyan-500/40'  },
  'Master Plan':{ text: 'text-sky-400',    bg: 'bg-sky-500/20',    border: 'border-sky-500/40'   },
};

export function ZoneTooltip({ zone, onClose, onQueryZone, conflicts = [] }) {
  if (!zone) return null;

  const accent = ZONE_ACCENT[zone.zone_type] || ZONE_ACCENT['Commercial'];

  // Filter conflicts relevant to this zone (if zone_code matches or use all passed conflicts)
  const zoneConflicts = conflicts.length > 0 ? conflicts : [];

  return (
    <div className="absolute left-4 top-4 z-[1000] w-[340px] bg-slate-900/97 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 border-b border-slate-800">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center space-x-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${accent.bg} ${accent.text} ${accent.border} border mb-1.5`}>
            <span>{zone.zone_type || 'Zone'}</span>
            {zone.zone_code && <span className="opacity-60">• {zone.zone_code}</span>}
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">{zone.zone_name || zone.name || 'Unnamed Zone'}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{zone.category || ''}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 shrink-0 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Governing Authority ───────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 flex items-center space-x-2 bg-slate-950/40">
        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-400">Governing Authority:</span>
        <span className="text-[11px] font-bold text-white">{zone.authority || zone.department || 'LDA'}</span>
      </div>

      {/* ── Bylaw Grid ───────────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-2">

        {/* FAR + Max Height Row */}
        {(zone.far || zone.max_height_ft) && (
          <div className="grid grid-cols-2 gap-2">
            {zone.far && zone.far !== 'N/A' && (
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1 mb-1">
                  <Ruler className={`w-3 h-3 ${accent.text}`} />
                  <span>Floor Area Ratio</span>
                </span>
                <p className={`text-base font-bold ${accent.text}`}>{zone.far}</p>
              </div>
            )}
            {zone.max_height_ft && (
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1 mb-1">
                  <ArrowUpRight className="w-3 h-3 text-blue-400" />
                  <span>Max Height</span>
                </span>
                <p className="text-base font-bold text-blue-400">{zone.max_height_ft} ft</p>
              </div>
            )}
          </div>
        )}

        {/* Setbacks */}
        {(zone.setback_front_ft || zone.setback_side_ft) && (
          <div className="space-y-1">
            {zone.setback_front_ft && (
              <div className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Front Road Setback:</span>
                <span className="font-semibold text-slate-200">{zone.setback_front_ft} ft mandatory</span>
              </div>
            )}
            {zone.setback_side_ft && (
              <div className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Side Setback:</span>
                <span className="font-semibold text-slate-200">{zone.setback_side_ft} ft</span>
              </div>
            )}
          </div>
        )}

        {/* Commercialization Status */}
        {zone.commercialization_status && zone.commercialization_status !== 'None' && (
          <div className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400">Commercialization:</span>
            <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${
              zone.commercialization_status === 'Permanent (List A)'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {zone.commercialization_status}
              {zone.dc_rate_percent ? ` — ${zone.dc_rate_percent}% DC Rate` : ''}
            </span>
          </div>
        )}

        {/* Permitted Uses */}
        {zone.permitted_uses && zone.permitted_uses.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">Permitted Land Uses:</p>
            <div className="flex flex-wrap gap-1">
              {zone.permitted_uses.map((u, idx) => (
                <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Conflict Detection Badge ─────────────────────────────── */}
      {zoneConflicts.length > 0 && (
        <div className="mx-4 mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1.5">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold text-amber-300">
              {zoneConflicts.length} Jurisdiction Conflict{zoneConflicts.length > 1 ? 's' : ''} Detected
            </span>
          </div>
          {zoneConflicts.slice(0, 2).map((c, idx) => (
            <div key={idx} className="text-[10px] text-slate-400 font-mono pl-5">
              ⚠ <span className="text-amber-300">{c.department}</span>: {c.conflict_type || c.message}
              {c.requires_joint_approval && (
                <span className="ml-1 text-rose-400 font-bold">— Joint Approval Required</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Footer: Gazette + Ask RAG ────────────────────────────── */}
      <div className="px-4 pb-4 pt-1 border-t border-slate-800 flex items-center justify-between mt-1">
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 max-w-[55%]">
          <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{zone.gazette_reference || 'LDA Bylaws'}</span>
        </div>
        <button
          onClick={() => onQueryZone && onQueryZone(zone)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Ask RAG AI</span>
        </button>
      </div>
    </div>
  );
}
