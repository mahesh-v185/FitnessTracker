import React from 'react';
import { DailyEntry } from '../types';
import { APP_NAME } from '../constants';

interface Props {
  entries: Record<string, DailyEntry>;
}

const ExportPanel: React.FC<Props> = ({ entries }) => {
  
  const generateCSV = () => {
    const headers = [
      'date', 'weight_kg', 'waist_cm', 'roadwork_km', 'pushups', 'squats', 
      'boxing_rounds', 'diet_pct', 'missed_day', 'is_imputed', 'notes'
    ];
    const rows = (Object.values(entries) as DailyEntry[]).sort((a, b) => a.date.localeCompare(b.date)).map(e => [
      e.date, e.weight_kg, e.waist_cm, e.roadwork_km, e.pushups_count, e.squats_count,
      e.boxing_rounds, e.diet_compliance_pct, e.missed_day_flag, e.is_imputed, `"${e.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${APP_NAME.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sqlSchema = `
-- Database Schema for IppoTracker
CREATE TABLE daily_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    version_number INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50) DEFAULT 'user',
    
    weight_kg DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    roadwork_km DECIMAL(4,2) DEFAULT 0,
    roadwork_time_min INT DEFAULT 0,
    pushups_count INT DEFAULT 0,
    squats_count INT DEFAULT 0,
    plank_sec INT DEFAULT 0,
    boxing_rounds INT DEFAULT 0,
    boxing_minutes INT DEFAULT 0,
    
    diet_compliance_pct INT CHECK (diet_compliance_pct BETWEEN 0 AND 100),
    water_liters DECIMAL(3,1),
    sleep_hours DECIMAL(3,1),
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    discipline_score INT CHECK (discipline_score BETWEEN 1 AND 10),
    
    missed_day_flag BOOLEAN DEFAULT FALSE,
    is_imputed BOOLEAN DEFAULT FALSE,
    carry_forward_from_date DATE,
    notes TEXT
);

-- Index for fast date lookups
CREATE INDEX idx_daily_entries_date ON daily_entries(date);
`;

const weeklyQuery = `
-- Weekly Summary Query
SELECT
  date_trunc('week', date) as week_start,
  SUM(roadwork_km) FILTER (WHERE is_imputed=false) as total_km,
  SUM(pushups_count) FILTER (WHERE is_imputed=false) as total_pushups,
  AVG(diet_compliance_pct) as avg_diet,
  (MAX(weight_kg) - MIN(weight_kg)) as weight_delta
FROM daily_entries
WHERE date >= NOW() - INTERVAL '100 days'
GROUP BY week_start
ORDER BY week_start DESC;
`;

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-6">
      <h2 className="text-xl font-bold text-slate-200">Data & Tech Specs</h2>
      
      <div>
        <button 
          onClick={generateCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download CSV (Excel Compatible)
        </button>
        <p className="text-xs text-slate-500 mt-2">Includes full history suitable for Excel analysis.</p>
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h3 className="text-sm font-bold text-slate-400 mb-2">SQL Schema</h3>
        <pre className="bg-slate-950 p-4 rounded text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
          {sqlSchema.trim()}
        </pre>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-400 mb-2">Sample Analysis Query</h3>
        <pre className="bg-slate-950 p-4 rounded text-xs text-blue-400 font-mono overflow-x-auto whitespace-pre-wrap">
          {weeklyQuery.trim()}
        </pre>
      </div>
    </div>
  );
};

export default ExportPanel;
