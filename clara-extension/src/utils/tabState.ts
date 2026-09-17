type TabSnapshot = {
  tabId: number | null;
  windowId: number | null;
  url: string;
  title: string;
  analysis: any | null;
  loading: boolean;
  error: string | null;
  deepAnalysisState: 'idle' | 'starting' | 'collecting' | 'analyzing' | 'correlating' | 'scoring' | 'completed' | 'failed';
  deepAnalysisError: string | null;
  timestamp: number;
};

const storageKey = 'clara-tab-state-v1';

const defaultSnapshot = (tabId: number | null, windowId: number | null, url = '', title = ''): TabSnapshot => ({
  tabId,
  windowId,
  url,
  title,
  analysis: null,
  loading: false,
  error: null,
  deepAnalysisState: 'idle',
  deepAnalysisError: null,
  timestamp: Date.now()
});

export const getTabStateStorageKey = () => storageKey;

export const readTabState = async (): Promise<Record<string, TabSnapshot>> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return {};
  return new Promise((resolve) => {
    chrome.storage.local.get([storageKey], (result) => {
      resolve((result[storageKey] as Record<string, TabSnapshot>) || {});
    });
  });
};

export const writeTabState = async (state: Record<string, TabSnapshot>): Promise<void> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  return new Promise((resolve) => {
    chrome.storage.local.set({ [storageKey]: state }, () => resolve());
  });
};

export const getStateKeyForTab = (tabId: number | null, windowId: number | null) => `${windowId ?? 'w'}-${tabId ?? 't'}`;

export const getOrCreateTabSnapshot = async (tabId: number | null, windowId: number | null, url = '', title = ''): Promise<TabSnapshot> => {
  const state = await readTabState();
  const key = getStateKeyForTab(tabId, windowId);
  const existing = state[key];
  if (existing) {
    return { ...existing, url: existing.url || url, title: existing.title || title };
  }
  const snapshot = defaultSnapshot(tabId, windowId, url, title);
  state[key] = snapshot;
  await writeTabState(state);
  return snapshot;
};

export const saveTabSnapshot = async (tabId: number | null, windowId: number | null, updates: Partial<TabSnapshot>): Promise<TabSnapshot> => {
  const state = await readTabState();
  const key = getStateKeyForTab(tabId, windowId);
  const existing = state[key] || defaultSnapshot(tabId, windowId);
  const next = { ...existing, ...updates, tabId, windowId, timestamp: Date.now() };
  state[key] = next;
  await writeTabState(state);
  return next;
};

export const getActiveTabSnapshot = async (tabId: number | null, windowId: number | null): Promise<TabSnapshot> => {
  const state = await readTabState();
  const key = getStateKeyForTab(tabId, windowId);
  return state[key] || defaultSnapshot(tabId, windowId);
};
