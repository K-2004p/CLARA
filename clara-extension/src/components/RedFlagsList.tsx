import React from 'react';
import { HiddenClause } from '../types';
import { AlertTriangle, Lock, FileWarning } from 'lucide-react';

interface Props {
  hiddenClauses: HiddenClause[];
}

export const RedFlagsList: React.FC<Props> = ({ hiddenClauses }) => {
  if (!hiddenClauses || hiddenClauses.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
        <span className="text-xs text-slate-400">No predatory hidden clauses detected.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <FileWarning className="w-4 h-4 text-rose-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
          Hidden & Predatory Clauses Flagged ({hiddenClauses.length})
        </h4>
      </div>

      {hiddenClauses.map((hc, idx) => (
        <div key={idx} className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-rose-300">{hc.category}</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {hc.riskLevel}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono bg-slate-950/50 p-2.5 rounded border border-rose-950/60 my-2">
            "{hc.snippet}"
          </p>

          <div className="flex items-start gap-1.5 text-xs text-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span>{hc.reason}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
