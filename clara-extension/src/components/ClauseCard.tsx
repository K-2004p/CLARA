import React from 'react';
import { Clause } from '../types';
import { useStore } from '../store/useStore';
import { AlertCircle, Eye, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  clause: Clause;
}

export const ClauseCard: React.FC<Props> = ({ clause }) => {
  const { selectedClauseId, highlightClauseInDOM } = useStore();
  const isSelected = selectedClauseId === clause.id;

  const getRiskBadge = () => {
    switch (clause.riskLevel) {
      case 'CRITICAL':
      case 'HIGH':
        return { bg: 'bg-rose-500/20 border-rose-500/40 text-rose-400', icon: ShieldAlert, label: 'High Risk' };
      case 'MEDIUM':
        return { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400', icon: AlertCircle, label: 'Medium Risk' };
      default:
        return { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', icon: CheckCircle2, label: 'Low Risk' };
    }
  };

  const badge = getRiskBadge();
  const Icon = badge.icon;

  return (
    <div
      className={`p-4 rounded-xl transition-all duration-300 border ${
        isSelected
          ? 'bg-slate-900 border-blue-500/80 shadow-lg shadow-blue-500/10'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">{clause.category}</span>
          <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{clause.sectionHeading}</h4>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${badge.bg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 font-mono leading-relaxed line-clamp-3 my-2">
        "{clause.text}"
      </p>

      <div className="mt-3 space-y-1.5 text-xs relative">
        <div className="flex items-start gap-1.5 text-slate-300 pr-6">
          <span className="font-bold text-slate-400 min-w-16">AI Insight:</span>
          <span>{clause.explanation}</span>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(clause.explanation);
                const { language } = useStore.getState();
                const langMap: Record<string, string> = {
                  'English': 'en-US', 'Hindi': 'hi-IN', 'Marathi': 'mr-IN',
                  'Gujarati': 'gu-IN', 'Tamil': 'ta-IN', 'Telugu': 'te-IN',
                  'Kannada': 'kn-IN', 'Malayalam': 'ml-IN', 'Bengali': 'bn-IN',
                  'Punjabi': 'pa-IN', 'Urdu': 'ur-IN'
                };
                utterance.lang = langMap[language] || 'en-US';
                window.speechSynthesis.speak(utterance);
              }
            }}
            className="absolute top-0 right-0 p-1 text-slate-500 hover:text-blue-400 transition-colors"
            title="Listen to Insight"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </button>
        </div>
        {clause.recommendation && (
          <div className="flex items-start gap-1.5 text-blue-300 pr-6">
            <span className="font-bold text-blue-400 min-w-16">Action:</span>
            <span>{clause.recommendation}</span>
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Order #{clause.orderIndex}</span>
        <button
          onClick={() => highlightClauseInDOM(clause)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold transition-colors border border-blue-500/30"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Highlight on Page</span>
        </button>
      </div>
    </div>
  );
};
