import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ScoreComparison } from '../types';

interface Props {
  data: ScoreComparison[];
}

export const RiskBarChart: React.FC<Props> = ({ data }) => {
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="w-full h-56 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-lg">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Trust & Transparency Ratings</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
