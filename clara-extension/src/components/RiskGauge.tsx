import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  score: number; // 0 - 100 overall risk score
  recommendation: string;
}

export const RiskGauge: React.FC<Props> = ({ score, recommendation }) => {
  let colorClass = 'text-emerald-500 stroke-emerald-500';
  let bgGlow = 'rgba(16, 185, 129, 0.15)';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (score > 70) {
    colorClass = 'text-rose-500 stroke-rose-500';
    bgGlow = 'rgba(239, 68, 68, 0.2)';
    Icon = ShieldAlert;
    label = 'High Risk Alert';
  } else if (score > 40) {
    colorClass = 'text-amber-500 stroke-amber-500';
    bgGlow = 'rgba(245, 158, 11, 0.2)';
    Icon = AlertTriangle;
    label = 'Moderate Caution';
  }

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: `drop-shadow(0 0 10px ${bgGlow})` }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">{score}</span>
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-400 mt-0.5">Risk Score</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/60 shadow-md">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="text-xs font-bold tracking-wide text-slate-200">{label}</span>
      </div>

      <div className="mt-3 text-center">
        <span className="text-sm font-semibold text-slate-300">Recommendation: </span>
        <span className={`text-sm font-bold ${score > 70 ? 'text-rose-400' : score > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {recommendation}
        </span>
      </div>
    </div>
  );
};
