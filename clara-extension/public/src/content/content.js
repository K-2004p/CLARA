// CLARA Content Script - Injected into web pages
// NOTE: this file is the script the manifest actually loads. Keep it in sync with
// src/content/content.ts, which is the readable/typed source of truth.

console.log('CLARA Legal AI content script active.');

const style = document.createElement('style');
style.textContent = `
  .clara-highlight-active {
    outline: 3px solid #ef4444 !important;
    outline-offset: 4px !important;
    background-color: rgba(239, 68, 68, 0.18) !important;
    transition: all 0.4s ease-in-out !important;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5) !important;
    border-radius: 4px !important;
  }
  .clara-notification-banner {
    position: fixed;
    top: 16px;
    right: 20px;
    z-index: 999999;
    background: #0f172a;
    color: #ffffff;
    border: 1px solid #334155;
    padding: 12px 18px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .clara-notification-banner:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(37,99,235,0.4);
  }
  .clara-badge {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #ffffff;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
`;
document.head.appendChild(style);

function detectLegalDocument() {
  const pageTitle = document.title.toLowerCase();
  const url = window.location.href.toLowerCase();
  const bodyText = (document.body?.innerText || '').substring(0, 3000).toLowerCase();

  const keywords = [
    'terms of service', 'privacy policy', 'terms & conditions', 'terms and conditions',
    'end user license agreement', 'eula', 'user agreement', 'privacy notice',
    'master service agreement', 'contract', 'cancellation policy', 'refund policy'
  ];

  return keywords.some(k => pageTitle.includes(k) || url.includes(k) || bodyText.includes(k));
}

// Security Evidence Extraction
function extractSecurityEvidence() {
  const forms = Array.from(document.querySelectorAll('form')).map(f => ({
    action: f.action,
    method: f.method,
    inputs: Array.from(f.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name }))
  }));

  const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src).filter(Boolean);

  const iframes = Array.from(document.querySelectorAll('iframe')).map(i => i.src).filter(Boolean);

  const hasPasswordInput = document.querySelector('input[type="password"]') !== null;
  const hasCreditCardInput = document.querySelector('input[name*="card"], input[name*="cc"], input[id*="card"]') !== null;

  return {
    forms,
    scripts,
    iframes,
    hasPasswordInput,
    hasCreditCardInput,
    documentCookieLength: document.cookie.length // Content scripts can only see non-HttpOnly cookies
  };
}

// Observe SPA Navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        { type: 'CLARA_PAGE_NAVIGATED', url, title: document.title },
        () => void chrome.runtime.lastError
      );
    }
  }
}).observe(document, { subtree: true, childList: true });

if (detectLegalDocument()) {
  const banner = document.createElement('div');
  banner.className = 'clara-notification-banner';
  banner.innerHTML = `
    <span class="clara-badge">CLARA AI</span>
    <span>Legal Agreement Detected — <b>Click to Audit Risk</b></span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  `;
  banner.onclick = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'CLARA_OPEN_SIDEBAR' });
    }
  };
  document.body.appendChild(banner);
}

function highlightClauseText(clauseText) {
  document.querySelectorAll('.clara-highlight-active').forEach(el => {
    el.classList.remove('clara-highlight-active');
  });

  if (!clauseText || clauseText.length < 5) return false;

  const snippet = clauseText.substring(0, 60).trim();
  const elements = Array.from(document.querySelectorAll('p, li, div, h1, h2, h3, h4, section, article, span'));

  for (const el of elements) {
    if (el.children.length === 0 && el.textContent && el.textContent.includes(snippet)) {
      el.classList.add('clara-highlight-active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
  }

  const words = snippet.split(' ').slice(0, 5).join(' ');
  for (const el of elements) {
    if (el.textContent && el.textContent.includes(words) && el.textContent.length < 1000) {
      el.classList.add('clara-highlight-active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
  }

  return false;
}

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CLARA_EXTRACT_DOM') {
      sendResponse({
        text: document.body.innerText,
        title: document.title,
        url: window.location.href,
        securityEvidence: extractSecurityEvidence()
      });
    } else if (message.type === 'CLARA_HIGHLIGHT_CLAUSE') {
      const found = highlightClauseText(message.text);
      sendResponse({ success: found });
    }
  });
}

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLARA_HIGHLIGHT_CLAUSE') {
    highlightClauseText(event.data.text);
  }
});
