import React, { useState } from 'react';
import { SidebarApp } from './sidebar/SidebarApp';
import { Scale, FileText, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'saas' | 'privacy'>('saas');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Left Pane: Webpage Legal Document Preview */}
      <div className="flex-1 p-6 border-r border-slate-800 overflow-y-auto max-h-screen">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Target Webpage</span>
              <h1 className="text-xl font-extrabold text-white">
                {activeDoc === 'saas' ? 'CloudScale SaaS Master Services Agreement' : 'Global Financial Data Privacy Policy'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDoc('saas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDoc === 'saas' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              SaaS Terms
            </button>
            <button
              onClick={() => setActiveDoc('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDoc === 'privacy' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </header>

        {/* Ambient CLARA Detection Pill */}
        <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-purple-950/80 border border-blue-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[10px] font-extrabold tracking-wide">
              CLARA AI ACTIVE
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Legal document automatically recognized — Risk Audit Ready
            </span>
          </div>
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>

        {/* Document Content */}
        <article className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          {activeDoc === 'saas' ? (
            <>
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">1. DISPUTE RESOLUTION AND MANDATORY ARBITRATION</h2>
              <p className="p-3 rounded bg-slate-950/40 border border-slate-800 font-mono text-xs">
                You agree that any dispute or claim relating in any way to your access or use of the Services will be resolved by binding arbitration, rather than in court. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
              </p>

              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">2. AUTOMATIC RENEWAL AND PAYMENT TERMS</h2>
              <p className="p-3 rounded bg-slate-950/40 border border-slate-800 font-mono text-xs">
                Your subscription will automatically renew at the end of each billing period unless cancelled at least 48 hours prior. All payment fees are non-refundable.
              </p>

              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">3. UNILATERAL AMENDMENTS</h2>
              <p className="p-3 rounded bg-slate-950/40 border border-slate-800 font-mono text-xs">
                We reserve the right to modify, amend, or alter these terms at any time in our sole discretion without prior notification to you. Continued use constitutes acceptance.
              </p>

              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">4. INTELLECTUAL PROPERTY & CONTENT LICENSE</h2>
              <p className="p-3 rounded bg-slate-950/40 border border-slate-800 font-mono text-xs">
                By submitting content, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, distribute, and commercialize all submitted feedback.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">1. DATA COLLECTION & THIRD-PARTY BROKERS</h2>
              <p className="p-3 rounded bg-slate-950/40 border border-slate-800 font-mono text-xs">
                We collect personal metadata, IP addresses, browser fingerprints, and device activity logs. We may share, monetize, or transfer your usage logs to third-party marketing brokers.
              </p>

              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">2. USER RIGHT TO DELETION (GDPR & CCPA)</h2>
              <p className="p-3 rounded bg-slate-950/40 border border-slate-800 font-mono text-xs">
                You may request account deletion and opt-out of personal data sales by contacting support@example.com under applicable privacy statutes.
              </p>
            </>
          )}
        </article>
      </div>

      {/* Right Pane: CLARA Edge Extension Sidebar Preview */}
      <div className="w-full md:w-[480px] bg-slate-950 border-l border-slate-800 flex flex-col h-screen">
        <SidebarApp />
      </div>
    </div>
  );
};
