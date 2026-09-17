import { create } from 'zustand';
import { LegalAnalysisResult, ChatMessage, Clause } from '../types';
import { getOrCreateTabSnapshot, getStateKeyForTab, saveTabSnapshot } from '../utils/tabState';

interface PersistedTabState {
  analysis: LegalAnalysisResult | null;
  loading: boolean;
  error: string | null;
  pageTitle: string;
  pageUrl: string;
  deepAnalysisState: 'idle' | 'starting' | 'collecting' | 'analyzing' | 'correlating' | 'scoring' | 'completed' | 'failed';
  deepAnalysisError: string | null;
  timestamp: number;
}

interface State {
  activeTab: 'overview' | 'breakdown' | 'clauses' | 'chat' | 'export' | 'manual';
  analysis: LegalAnalysisResult | null;
  loading: boolean;
  error: string | null;
  selectedClauseId: string | null;
  chatMessages: ChatMessage[];
  pageTitle: string;
  pageUrl: string;
  isDarkMode: boolean;
  language: string;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentTabId: number | null;
  currentWindowId: number | null;
  activeContextKey: string;
  deepAnalysisState: 'idle' | 'starting' | 'collecting' | 'analyzing' | 'correlating' | 'scoring' | 'completed' | 'failed';
  deepAnalysisError: string | null;
  lastAnalyzedContextKey: string | null;
  lastAnalyzedUrl: string | null;
  tabSnapshots: Record<string, PersistedTabState>;

  setActiveTab: (tab: 'overview' | 'breakdown' | 'clauses' | 'chat' | 'export' | 'manual') => void;
  setAnalysis: (result: LegalAnalysisResult | null) => Promise<void>;
  setLoading: (loading: boolean) => Promise<void>;
  setError: (error: string | null) => Promise<void>;
  setSelectedClauseId: (id: string | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  setPageInfo: (title: string, url: string) => Promise<void>;
  toggleDarkMode: () => void;
  highlightClauseInDOM: (clause: Clause) => void;
  setLanguage: (lang: string) => void;
  setHasCompletedOnboarding: (val: boolean) => void;
  setCurrentContext: (tabId: number | null, windowId: number | null, title: string, url: string) => Promise<void>;
  setDeepAnalysisState: (state: 'idle' | 'starting' | 'collecting' | 'analyzing' | 'correlating' | 'scoring' | 'completed' | 'failed', error?: string | null) => Promise<void>;
  persistCurrentSnapshot: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  activeTab: 'overview',
  analysis: null,
  loading: false,
  error: null,
  selectedClauseId: null,
  chatMessages: [
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am CLARA, your AI Legal Assistant. Ask me anything about this contract or policy.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  pageTitle: 'Legal Document',
  pageUrl: '',
  isDarkMode: true,
  language: 'English',
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  currentTabId: null,
  currentWindowId: null,
  activeContextKey: 'default',
  deepAnalysisState: 'idle',
  deepAnalysisError: null,
  lastAnalyzedContextKey: null,
  lastAnalyzedUrl: null,
  tabSnapshots: {},

  setActiveTab: (activeTab) => set({ activeTab }),
  setAnalysis: async (analysis) => {
    set({ analysis, loading: false, lastAnalyzedContextKey: get().activeContextKey, lastAnalyzedUrl: get().pageUrl });
    await get().persistCurrentSnapshot();
  },
  setLoading: async (loading) => {
    set({ loading });
    await get().persistCurrentSnapshot();
  },
  setError: async (error) => {
    set({ error, loading: false });
    await get().persistCurrentSnapshot();
  },
  setSelectedClauseId: (selectedClauseId) => set({ selectedClauseId }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  setPageInfo: async (pageTitle, pageUrl) => {
    set({ pageTitle, pageUrl });
    await get().persistCurrentSnapshot();
  },
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLanguage: (language) => set({ language }),
  setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
  setCurrentContext: async (currentTabId, currentWindowId, pageTitle, pageUrl) => {
    const activeContextKey = getStateKeyForTab(currentTabId, currentWindowId);
    const snapshot = await getOrCreateTabSnapshot(currentTabId, currentWindowId, pageUrl, pageTitle);

    set((state) => ({
      currentTabId,
      currentWindowId,
      activeContextKey,
      pageTitle: pageTitle || snapshot.title || state.pageTitle,
      pageUrl: pageUrl || snapshot.url || state.pageUrl,
      analysis: snapshot.analysis || null,
      loading: snapshot.loading || false,
      error: snapshot.error || null,
      deepAnalysisState: snapshot.deepAnalysisState || 'idle',
      deepAnalysisError: snapshot.deepAnalysisError || null,
      tabSnapshots: {
        ...state.tabSnapshots,
        [activeContextKey]: {
          analysis: snapshot.analysis || null,
          loading: snapshot.loading || false,
          error: snapshot.error || null,
          pageTitle: pageTitle || snapshot.title || state.pageTitle,
          pageUrl: pageUrl || snapshot.url || state.pageUrl,
          deepAnalysisState: snapshot.deepAnalysisState || 'idle',
          deepAnalysisError: snapshot.deepAnalysisError || null,
          timestamp: snapshot.timestamp || Date.now()
        }
      }
    }));
  },
  setDeepAnalysisState: async (deepAnalysisState, deepAnalysisError = null) => {
    set({ deepAnalysisState, deepAnalysisError });
    await get().persistCurrentSnapshot();
  },
  persistCurrentSnapshot: async () => {
    const snapshotState = get();
    const activeContextKey = snapshotState.activeContextKey || getStateKeyForTab(snapshotState.currentTabId, snapshotState.currentWindowId);
    const snapshot = {
      tabId: snapshotState.currentTabId,
      windowId: snapshotState.currentWindowId,
      url: snapshotState.pageUrl,
      title: snapshotState.pageTitle,
      analysis: snapshotState.analysis,
      loading: snapshotState.loading,
      error: snapshotState.error,
      deepAnalysisState: snapshotState.deepAnalysisState,
      deepAnalysisError: snapshotState.deepAnalysisError,
      timestamp: Date.now()
    };

    await saveTabSnapshot(snapshotState.currentTabId, snapshotState.currentWindowId, snapshot);
    set((state) => ({
      activeContextKey,
      tabSnapshots: {
        ...state.tabSnapshots,
        [activeContextKey]: {
          analysis: snapshot.analysis,
          loading: snapshot.loading,
          error: snapshot.error,
          pageTitle: snapshot.title,
          pageUrl: snapshot.url,
          deepAnalysisState: snapshot.deepAnalysisState,
          deepAnalysisError: snapshot.deepAnalysisError,
          timestamp: snapshot.timestamp
        }
      }
    }));
  },

  highlightClauseInDOM: (clause) => {
    set({ selectedClauseId: clause.id });
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'CLARA_HIGHLIGHT_CLAUSE', text: clause.text, clauseId: clause.id }, '*');
    }
    // Also send Chrome extension runtime message if available
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'CLARA_HIGHLIGHT_CLAUSE',
            text: clause.text,
            clauseId: clause.id
          });
        }
      });
    }
  }
}));
