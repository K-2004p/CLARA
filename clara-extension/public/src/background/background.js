// CLARA Extension Background Service Worker (Manifest V3)
// NOTE: this file is the script the manifest actually loads. Keep it in sync with
// src/background/background.ts, which is the readable/typed source of truth.

console.log('CLARA Extension background service worker started.');

const notifyActiveContext = (tabId) => {
  if (typeof tabId !== 'number' || !chrome.runtime) return;

  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) return;
    chrome.runtime.sendMessage({
      type: 'CLARA_ACTIVE_CONTEXT_CHANGED',
      tabId: tab.id,
      windowId: tab.windowId,
      title: tab.title || 'Legal Document',
      url: tab.url || ''
    }, () => void chrome.runtime.lastError);
  });
};

// Handle extension icon clicks -> toggle Side Panel
chrome.action?.onClicked?.addListener((tab) => {
  if (tab.id && chrome.sidePanel) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Setup context menus on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'clara-audit-selection',
    title: 'Audit Legal Risk with CLARA AI',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'clara-audit-page',
    title: 'Analyze Document Clauses on Page',
    contexts: ['page']
  });
});

// Keep the sidebar aware when the user switches tabs, windows, or navigates.
chrome.tabs.onActivated.addListener(({ tabId }) => {
  notifyActiveContext(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab?.active) {
    notifyActiveContext(tabId);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]?.id) {
        notifyActiveContext(tabs[0].id);
      }
    });
  }
});

// Context Menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'clara-audit-selection' && info.selectionText) {
    chrome.sidePanel.open({ tabId: tab.id });
    chrome.tabs.sendMessage(tab.id, {
      type: 'CLARA_AUDIT_TEXT',
      text: info.selectionText
    }, () => void chrome.runtime.lastError);
  } else if (info.menuItemId === 'clara-audit-page') {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle incoming messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLARA_OPEN_SIDEBAR' && sender.tab?.id) {
    if (chrome.sidePanel) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  } else if (message.type === 'CLARA_PAGE_NAVIGATED' && sender.tab?.id) {
    notifyActiveContext(sender.tab.id);
  } else if (message.type === 'CLARA_COLLECT_DEEP_EVIDENCE') {
    const url = message.url;
    (async () => {
      try {
        const res = await fetch(url, { method: 'HEAD' }).catch(() => fetch(url));
        const headers = {};
        res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

        let cookies = [];
        if (chrome.cookies) {
          cookies = await new Promise((resolve) => {
            chrome.cookies.getAll({ url }, (c) => resolve(c || []));
          });
        }
        sendResponse({ headers, cookies });
      } catch (e) {
        sendResponse({ headers: {}, cookies: [], error: e?.message || String(e) });
      }
    })();
    return true; // Keep message channel open for async response
  }
  return true;
});
