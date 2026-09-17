import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { analyzeDocument, getReportUrl } from '../utils/api';
import { Header } from '../components/Header';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { ManualAnalysisPanel } from '../components/ManualAnalysisPanel';
import { RiskGauge } from '../components/RiskGauge';
import { ScoreCard } from '../components/ScoreCard';
import { RiskRadarChart } from '../components/RiskRadarChart';
import { RiskBarChart } from '../components/RiskBarChart';
import { ClauseCard } from '../components/ClauseCard';
import { RedFlagsList } from '../components/RedFlagsList';
import { ChatPanel } from '../components/ChatPanel';
import {
  ShieldCheck,
  Eye,
  Lock,
  DollarSign,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Download,
  FileCode,
  Upload,
  RefreshCw,
  Sparkles,
  Search
} from 'lucide-react';

export const SidebarApp: React.FC = () => {
  const {
    activeTab,
    analysis,
    setAnalysis,
    loading,
    setLoading,
    error,
    setError,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    setLanguage,
    language,
    setCurrentContext,
    setPageInfo,
    setDeepAnalysisState,
    deepAnalysisState
  } = useStore();
  const [clauseFilter, setClauseFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'HIDDEN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const getActiveTabContext = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      return new Promise<{ tabId: number | null; windowId: number | null; title: string; url: string }>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          resolve({
            tabId: activeTab?.id ?? null,
            windowId: activeTab?.windowId ?? null,
            title: activeTab?.title || 'Legal Document',
            url: activeTab?.url || ''
          });
        });
      });
    }

    return {
      tabId: null,
      windowId: null,
      title: document.title || 'Legal Document',
      url: window.location.href || ''
    };
  };

  const extractActiveDocument = async (tabId: number | null) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && tabId) {
      return new Promise<{ text: string; title: string; url: string; securityEvidence?: any } | null>((resolve) => {
        chrome.tabs.sendMessage(tabId, { type: 'CLARA_EXTRACT_DOM' }, (response) => {
          if (response && response.text) {
            resolve({ text: response.text, title: response.title || 'Legal Document', url: response.url || '', securityEvidence: response.securityEvidence });
            return;
          }
          resolve(null);
        });
      });
    }

    return null;
  };

  const runAnalysis = async (mode: 'standard' | 'deep' = 'standard') => {
    if (loading) return;

    const currentContextKey = useStore.getState().activeContextKey;
    const currentUrl = useStore.getState().pageUrl;
    if (mode === 'deep' && useStore.getState().lastAnalyzedContextKey === currentContextKey && useStore.getState().lastAnalyzedUrl === currentUrl && useStore.getState().deepAnalysisState === 'completed') {
      return;
    }

    await setLoading(true);
    await setError(null);
    if (mode === 'deep') {
      await setDeepAnalysisState('starting');
    }

    try {
      const context = await getActiveTabContext();
      await setCurrentContext(context.tabId, context.windowId, context.title, context.url);

      if (typeof chrome !== 'undefined' && chrome.tabs) {
        if (mode === 'deep') await setDeepAnalysisState('collecting');
        
        const response = await extractActiveDocument(context.tabId);
        
        let deepEvidence = {};
        if (mode === 'deep') {
          deepEvidence = await new Promise((resolve) => {
             chrome.runtime.sendMessage({ type: 'CLARA_COLLECT_DEEP_EVIDENCE', url: context.url }, (res) => resolve(res || {}));
          });
          await setDeepAnalysisState('analyzing');
        }

        if (response?.text) {
          await setPageInfo(response.title || context.title, response.url || context.url);
          if (mode === 'deep') await setDeepAnalysisState('correlating');
          
          // Slight artificial delays in deep mode for UI progression effect
          if (mode === 'deep') await new Promise(r => setTimeout(r, 600));
          
          if (mode === 'deep') await setDeepAnalysisState('scoring');
          const result = await analyzeDocument(
            response.text, 
            response.title || context.title, 
            response.url || context.url, 
            language,
            { mode, securityEvidence: response.securityEvidence, deepEvidence }
          );
          await setAnalysis(result);
        } else {
          const result = await analyzeDocument('Sample Agreement Document Text', context.title || 'Standard Terms', context.url || window.location.href, language, { mode });
          await setPageInfo(context.title || 'Standard Terms', context.url || window.location.href);
          await setAnalysis(result);
        }
      } else {
        const result = await analyzeDocument('', 'Sample SaaS Master Services Agreement', 'https://example.com/terms', language, { mode });
        await setPageInfo('Sample SaaS Master Services Agreement', 'https://example.com/terms');
        await setAnalysis(result);
      }

      if (mode === 'deep') {
        await setDeepAnalysisState('completed');
      }
    } catch (err: any) {
      await setError(err?.message || 'Failed to complete security audit.');
      if (mode === 'deep') {
        await setDeepAnalysisState('failed', err?.message || 'Failed to complete security audit.');
      }
    }
  };

  const triggerAnalysis = async () => {
    await runAnalysis('standard');
  };

  const triggerDeepAnalysis = async () => {
    await runAnalysis('deep');
  };

  useEffect(() => {
    // Load state from chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['claraLanguage', 'claraOnboarded'], (result) => {
        if (result.claraLanguage) setLanguage(String(result.claraLanguage));
        if (result.claraOnboarded) setHasCompletedOnboarding(true);
      });
    }
  }, [setLanguage, setHasCompletedOnboarding]);

  useEffect(() => {
    let removeMessageListener: (() => void) | undefined;

    const initializeContext = async () => {
      const context = await getActiveTabContext();
      await setCurrentContext(context.tabId, context.windowId, context.title, context.url);

      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const handleContextMessage = (message: any) => {
          if (message?.type === 'CLARA_ACTIVE_CONTEXT_CHANGED') {
            void setCurrentContext(message.tabId ?? null, message.windowId ?? null, message.title || 'Legal Document', message.url || '');
          }
        };

        chrome.runtime.onMessage.addListener(handleContextMessage);
        removeMessageListener = () => chrome.runtime.onMessage.removeListener(handleContextMessage);
      }
    };

    void initializeContext();

    return () => {
      if (removeMessageListener) removeMessageListener();
    };
  }, [setCurrentContext]);

  useEffect(() => {
    if (!analysis && !loading && hasCompletedOnboarding) {
      void triggerAnalysis();
    }
  }, [analysis, loading, hasCompletedOnboarding]);

  const handleDownloadJSON = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CLARA_Legal_Audit_${analysis.documentId || 'Report'}.json`;
    a.click();
  };

  const handleDownloadCSV = () => {
    if (!analysis) return;
    const headers = ['ID', 'Section', 'Category', 'Risk Level', 'AI Explanation', 'Recommendation'];
    const rows = analysis.clauses.map(c => [
      c.id, 
      `"${c.sectionHeading.replace(/"/g, '""')}"`, 
      `"${c.category}"`, 
      c.riskLevel, 
      `"${c.explanation.replace(/"/g, '""')}"`, 
      `"${c.recommendation.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CLARA_Risk_Clauses_${analysis.documentId || 'Report'}.csv`;
    a.click();
  };

  const filteredClauses = (analysis?.clauses || []).filter((c) => {
    const matchesFilter =
      clauseFilter === 'ALL'
        ? true
        : clauseFilter === 'HIGH'
        ? c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL'
        : clauseFilter === 'MEDIUM'
        ? c.riskLevel === 'MEDIUM'
        : c.isHidden;
    const matchesSearch =
      c.sectionHeading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {!hasCompletedOnboarding && <WelcomeScreen />}
      <Header />

      <main className="flex-1 p-4 max-w-xl mx-auto w-full space-y-4 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-200">Executing RAG Clause Analysis...</span>
            <p className="text-xs text-slate-400">Segmenting text, querying vector DB & calculating risk scores</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">Audit Failed</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
            <button
              onClick={() => void triggerAnalysis()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          </div>
        )}

        {!loading && !analysis && !error && (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <Search className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              No audit yet for this tab. Run an analysis on the current page, or use the Manual tab to
              paste a URL or upload a document.
            </p>
            <button
              onClick={() => void triggerAnalysis()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Analyze This Page
            </button>
          </div>
        )}

        {!loading && analysis && (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <RiskGauge score={analysis.overallRisk} recommendation={analysis.recommendation} />

                {/* Score Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <ScoreCard title="Trust Rating" score={analysis.trustScore} icon={ShieldCheck} color="emerald" />
                  <ScoreCard title="Privacy Score" score={analysis.privacyScore} icon={Lock} color="blue" />
                  <ScoreCard title="Financial Risk" score={analysis.financialRisk} icon={DollarSign} color="amber" invertRisk />
                  <ScoreCard title="Compliance Risk" score={analysis.complianceRisk} icon={AlertOctagon} color="rose" invertRisk />
                </div>

                {/* Executive Summary Box */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Executive AI Summary</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Hidden Predatory Clauses */}
                <RedFlagsList hiddenClauses={analysis.hiddenClauses} />

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5" /> Favorable Terms ({analysis.pros?.length || 0})
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {analysis.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                      <XCircle className="w-3.5 h-3.5" /> Cautionary Concerns ({analysis.cons?.length || 0})
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {analysis.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* BREAKDOWN TAB */}
            {activeTab === 'breakdown' && (
              <div className="space-y-4">
                <RiskRadarChart data={analysis.graphData?.riskRadar || []} />
                <RiskBarChart data={analysis.graphData?.scoreComparison || []} />

                {/* Risk Categories */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Risk Categories breakdown</h4>
                  <div className="space-y-2.5">
                    {analysis.riskCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white">{cat.risk}%</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cat.level === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {cat.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CLAUSES TAB */}
            {activeTab === 'clauses' && (
              <div className="space-y-3">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search clauses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['ALL', 'HIGH', 'MEDIUM', 'HIDDEN'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setClauseFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          clauseFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredClauses.map((clause) => (
                    <ClauseCard key={clause.id} clause={clause} />
                  ))}
                  {filteredClauses.length === 0 && (
                    <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                      No matching clauses found for criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && <ChatPanel />}

            {/* MANUAL TAB */}
            {activeTab === 'manual' && <ManualAnalysisPanel />}

            {/* EXPORT TAB */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                  <Download className="w-8 h-8 text-blue-400 mx-auto" />
                  <h3 className="text-sm font-extrabold text-white">Export Audit Documentation</h3>
                  <p className="text-xs text-slate-400">
                    Download full legal risk report as formatted PDF audit document or structured JSON for enterprise API integration.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={getReportUrl(analysis.documentId || 'demo')}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF Audit</span>
                    </a>

                    <div className="flex-1 flex flex-col gap-2">
                      <button
                        onClick={handleDownloadJSON}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                      >
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>Export JSON</span>
                      </button>
                      
                      <button
                        onClick={handleDownloadCSV}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                      >
                        <FileCode className="w-4 h-4 text-amber-400" />
                        <span>Export CSV (Clauses)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Deep Analysis Button */}
                <button
                  onClick={() => void triggerDeepAnalysis()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white text-xs font-semibold border border-blue-500/30 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {loading && ['starting', 'collecting', 'analyzing', 'correlating', 'scoring'].includes(deepAnalysisState)
                      ? `Running Deep Analysis — ${deepAnalysisState}…`
                      : 'Run Deep Analysis'}
                  </span>
                </button>

                <button
                  onClick={() => void triggerAnalysis()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Analyze Current Webpage</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
