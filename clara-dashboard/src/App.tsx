import { useState } from 'react';
import { ShieldCheck, FileText, Search, Download, Settings, User } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md text-center shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-2xl font-extrabold text-white mb-2">CLARA Dashboard</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to manage your AI legal risk audits, settings, and team policies.</p>
          
          <button 
            onClick={() => setIsAuthenticated(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Sign in with Microsoft
          </button>
          <button 
            onClick={() => setIsAuthenticated(true)}
            className="w-full mt-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-extrabold text-white">CLARA</span>
        </div>

        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-semibold border border-blue-500/30">
            <FileText className="w-5 h-5" />
            Saved Reports
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-xl font-semibold transition-colors">
            <Search className="w-5 h-5" />
            Search History
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-xl font-semibold transition-colors">
            <Settings className="w-5 h-5" />
            Preferences
          </a>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-xl font-semibold transition-colors w-full">
            <User className="w-5 h-5" />
            Account
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Saved Reports</h2>
            <p className="text-slate-400">Manage your past legal risk audits from the extension.</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Report Cards */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] px-2 py-1 rounded font-bold ${i % 2 === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {i % 2 === 0 ? 'Proceed Carefully' : 'Reject or Revisions'}
                </span>
                <span className="text-xs text-slate-500">Aug {10 - i}, 2026</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">SaaS Master Services Agreement {i}</h3>
              <p className="text-sm text-slate-400 mb-6 line-clamp-2">CLARA Audit Completed: Document evaluated with an Overall Risk Score of {70 + i}/100. We flagged multiple red flags.</p>
              
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  Risk: {70 + i}
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Trust: {30 - i}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
