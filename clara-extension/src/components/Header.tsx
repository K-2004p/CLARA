import React from 'react';
import { useStore } from '../store/useStore';
import { Scale, LayoutDashboard, PieChart, FileText, MessageSquare, Download, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, isDarkMode, toggleDarkMode, analysis } = useStore();

  const tabs: {
    id: 'overview' | 'breakdown' | 'clauses' | 'chat' | 'manual' | 'export';
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'breakdown', label: 'Analytics', icon: PieChart },
    { id: 'clauses', label: 'Clauses', icon: FileText, badge: analysis?.clauses?.length },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'manual', label: 'Manual', icon: FileText },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-white">CLARA AI</h1>
            <p className="text-[10px] text-slate-400 font-medium">Clause Risk Engine</p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      <nav className="flex items-center px-2 gap-1 border-t border-slate-900 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
