import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RadarMetric } from '../types';

interface Props {
  data: RadarMetric[];
}

export const RiskRadarChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-64 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-lg">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">5-Dimension Risk Breakdown</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
          <Radar
            name="Risk Level"
            dataKey="A"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
