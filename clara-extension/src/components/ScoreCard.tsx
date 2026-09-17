import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  score: number;
  icon: LucideIcon;
  color: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  invertRisk?: boolean;
}

export const ScoreCard: React.FC<Props> = ({ title, score, icon: Icon, color, invertRisk }) => {
  const getProgressColor = () => {
    if (color === 'emerald') return 'bg-emerald-500';
    if (color === 'amber') return 'bg-amber-500';
    if (color === 'rose') return 'bg-rose-500';
    if (color === 'purple') return 'bg-purple-500';
    return 'bg-blue-500';
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300">{title}</span>
        </div>
        <span className="text-base font-extrabold text-white">{score}</span>
      </div>

      <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-700`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};
