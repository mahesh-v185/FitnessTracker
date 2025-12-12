import React from 'react';
import { DailyEntry } from '../types';

interface Props {
  entries: Record<string, DailyEntry>;
  onSelectDate: (date: string) => void;
}

const HistoryList: React.FC<Props> = ({ entries, onSelectDate }) => {
  const sortedDates = Object.keys(entries).sort((a, b) => b.localeCompare(a)); // Descending

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="p-4 bg-slate-800/50 border-b border-slate-800">
        <h3 className="font-bold text-slate-300">History Log</h3>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-900 sticky top-0">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Run</th>
              <th className="px-4 py-3">Comp.</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedDates.map(date => {
              const entry = entries[date];
              return (
                <tr key={date} className={`hover:bg-slate-800/50 transition-colors ${entry.missed_day_flag ? 'bg-rose-950/10' : ''}`}>
                  <td className="px-4 py-3 font-mono text-slate-300">{date}</td>
                  <td className="px-4 py-3 text-slate-400">{entry.weight_kg}kg</td>
                  <td className="px-4 py-3 text-slate-400">{entry.roadwork_km}km</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${entry.diet_compliance_pct >= 80 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                        {entry.diet_compliance_pct}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.is_imputed ? (
                        <span className="text-amber-500 text-xs flex items-center gap-1">
                            ⚠️ Missed
                        </span>
                    ) : (
                        <span className="text-emerald-500 text-xs">Logged</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                        onClick={() => onSelectDate(date)}
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        {entry.is_imputed ? 'Fix' : 'Edit'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;
