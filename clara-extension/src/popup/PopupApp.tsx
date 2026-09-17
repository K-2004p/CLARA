import React, { useEffect, useState } from 'react';
import { Scale, ShieldAlert, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { analyzeDocument } from '../utils/api';
import { LegalAnalysisResult } from '../types';

export const PopupApp: React.FC = () => {
  const [analysis, setAnalysis] = useState<LegalAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'CLARA_EXTRACT_DOM' }, async (response) => {
            if (response && response.text) {
              const res = await analyzeDocument(
                response.text,
                response.title || tabs[0]?.title || 'Web Page',
                response.url || tabs[0]?.url || '',
                'English',
                { securityEvidence: response.securityEvidence }
              );
              setAnalysis(res);
            } else {
              const res = await analyzeDocument(
                '',
                tabs[0]?.title || 'Web Page',
                tabs[0]?.url || ''
              );
              setAnalysis(res);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    } else {
      analyzeDocument('Sample text', 'Terms of Service', '').then((res) => {
        setAnalysis(res);
        setLoading(false);
      });
    }
  }, []);

  const openSidebar = () => {
    if (typeof chrome !== 'undefined' && chrome.sidePanel) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id });
        }
      });
    }
  };

  return (
    <div className="w-80 p-4 bg-slate-950 text-slate-100 font-sans border border-slate-800 shadow-2xl rounded-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white">
            <Scale className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">CLARA AI Audit</h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
          v1.0
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Scanning page legal content...</div>
      ) : analysis ? (
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Overall Risk</span>
              <div className="text-xl font-extrabold text-white">{analysis.overallRisk}/100</div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                analysis.overallRisk > 70
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {analysis.recommendation}
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed line-clamp-2">
            {analysis.summary}
          </div>

          <button
            onClick={openSidebar}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <span>Open Full AI Sidebar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">No active document scanned.</div>
      )}
    </div>
  );
};
