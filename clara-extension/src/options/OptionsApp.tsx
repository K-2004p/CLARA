import React, { useEffect, useState } from 'react';
import { Scale, Save, Key, Server, ShieldCheck, Check } from 'lucide-react';
import { DEFAULT_API_BASE_URL, readSettings, writeSettings } from '../utils/api';

export const OptionsApp: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_BASE_URL);
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const settings = await readSettings();
      setApiUrl(settings.apiBaseUrl);
      setAutoHighlight(settings.autoHighlight);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await writeSettings({ apiBaseUrl: apiUrl, autoHighlight });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">CLARA AI Settings</h1>
            <p className="text-xs text-slate-400">Configure backend server endpoints and AI model credentials</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" /> Backend API Endpoint
            </h3>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" /> Gemini 2.5 Flash API Key (Optional)
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The Gemini key is held by the backend, never by the browser — set the{' '}
              <code className="px-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">GEMINI_API_KEY</code>{' '}
              environment variable where the CLARA API runs. Leave it unset to use CLARA's built-in
              deterministic RAG risk engine instead.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200">Auto-Highlight Red Flags</h3>
              <p className="text-[11px] text-slate-400">Automatically outline predatory clauses in webpage DOM</p>
            </div>
            <input
              type="checkbox"
              checked={autoHighlight}
              onChange={(e) => setAutoHighlight(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
