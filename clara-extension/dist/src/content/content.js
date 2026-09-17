console.log("CLARA Legal AI content script active.");const l=document.createElement("style");l.textContent=`
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
`;document.head.appendChild(l);function d(){var t;const e=document.title.toLowerCase(),r=window.location.href.toLowerCase(),o=(((t=document.body)==null?void 0:t.innerText)||"").substring(0,3e3).toLowerCase();return["terms of service","privacy policy","terms & conditions","terms and conditions","end user license agreement","eula","user agreement","privacy notice","master service agreement","contract","cancellation policy","refund policy"].some(i=>e.includes(i)||r.includes(i)||o.includes(i))}function p(){const e=Array.from(document.querySelectorAll("form")).map(n=>({action:n.action||"",method:(n.method||"GET").toUpperCase(),inputs:Array.from(n.querySelectorAll("input")).map(c=>({type:c.type,name:c.name}))})),r=Array.from(document.querySelectorAll("script")).map(n=>n.src).filter(Boolean),o=Array.from(document.querySelectorAll("iframe")).map(n=>n.src).filter(Boolean),a=document.querySelector('input[type="password"]')!==null,t=document.querySelector('input[name*="card"], input[name*="cc"], input[id*="card"]')!==null;let i=0;try{i=window.localStorage?window.localStorage.length:0}catch{i=0}return{forms:e,scripts:r,iframes:o,hasPasswordInput:a,hasCreditCardInput:t,documentCookieLength:document.cookie?document.cookie.length:0,protocol:window.location.protocol,hostname:window.location.hostname,storageCount:i,isLegalDoc:d()}}let s=location.href;new MutationObserver(()=>{const e=location.href;e!==s&&(s=e,typeof chrome<"u"&&chrome.runtime&&chrome.runtime.sendMessage({type:"CLARA_PAGE_NAVIGATED",url:e,title:document.title}))}).observe(document,{subtree:!0,childList:!0});if(d()){const e=document.createElement("div");e.className="clara-notification-banner",e.innerHTML=`
    <span class="clara-badge">CLARA AI</span>
    <span>Legal Agreement Detected — <b>Click to Audit Risk</b></span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  `,e.onclick=()=>{typeof chrome<"u"&&chrome.runtime&&chrome.runtime.sendMessage({type:"CLARA_OPEN_SIDEBAR"})},document.body.appendChild(e)}function u(e){if(document.querySelectorAll(".clara-highlight-active").forEach(t=>{t.classList.remove("clara-highlight-active")}),!e||e.length<5)return!1;const r=e.substring(0,60).trim(),o=Array.from(document.querySelectorAll("p, li, div, h1, h2, h3, h4, section, article, span"));for(const t of o)if(t.children.length===0&&t.textContent&&t.textContent.includes(r))return t.classList.add("clara-highlight-active"),t.scrollIntoView({behavior:"smooth",block:"center"}),!0;const a=r.split(" ").slice(0,5).join(" ");for(const t of o)if(t.textContent&&t.textContent.includes(a)&&t.textContent.length<1e3)return t.classList.add("clara-highlight-active"),t.scrollIntoView({behavior:"smooth",block:"center"}),!0;return!1}typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage.addListener((e,r,o)=>{if(e.type==="CLARA_EXTRACT_DOM")o({text:document.body.innerText,title:document.title,url:window.location.href,securityEvidence:p()});else if(e.type==="CLARA_HIGHLIGHT_CLAUSE"){const a=u(e.text);o({success:a})}});window.addEventListener("message",e=>{e.data&&e.data.type==="CLARA_HIGHLIGHT_CLAUSE"&&u(e.data.text)});
