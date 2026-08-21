import React from 'react';
import { Layers, ShieldCheck, Ruler, ArrowUpRight, FileCheck } from 'lucide-react';

export function ZoneTooltip({ zone, onClose, onQueryZone }) {
  if (!zone) return null;

  return (
    <div className="absolute left-6 top-20 z-20 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-fade-in">
      <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
        <div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
            {zone.zone_code}
          </span>
          <h3 className="text-sm font-bold text-white mt-1">{zone.zone_name}</h3>
          <p className="text-[11px] text-slate-400">{zone.category}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
            <Ruler className="w-3 h-3 text-emerald-400" />
            <span>Permitted FAR</span>
          </span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">{zone.far}</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3 text-blue-400" />
            <span>Max Height</span>
          </span>
          <p className="text-base font-bold text-blue-400 mt-0.5">{zone.max_height_ft} ft</p>
        </div>
      </div>

      <div className="space-y-2 text-xs mb-3">
        <div className="flex items-center justify-between text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400">Front Setback:</span>
          <span className="font-semibold text-slate-200">{zone.setback_front_ft} ft compulsory</span>
        </div>
        <div className="flex items-center justify-between text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400">Side Setback:</span>
          <span className="font-semibold text-slate-200">{zone.setback_side_ft} ft</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">Permitted Land Uses:</p>
        <div className="flex flex-wrap gap-1">
          {zone.permitted_uses && zone.permitted_uses.map((u, idx) => (
            <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
              {u}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-[10px] text-slate-400">
          <FileCheck className="w-3 h-3 text-emerald-400" />
          <span className="truncate max-w-[150px]">{zone.gazette_reference}</span>
        </div>
        <button
          onClick={() => onQueryZone(zone)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow transition-all"
        >
          Ask RAG AI
        </button>
      </div>
    </div>
  );
}
