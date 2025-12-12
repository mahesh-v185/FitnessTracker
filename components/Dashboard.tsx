import React, { useMemo } from 'react';
import { DailyEntry } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';

interface Props {
  entries: Record<string, DailyEntry>;
}

const Dashboard: React.FC<Props> = ({ entries }) => {
  const sortedEntries = useMemo(() => {
    return (Object.values(entries) as DailyEntry[]).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  // Calculate Metrics
  const last7Days = sortedEntries.slice(-7);
  const totalKm = last7Days.reduce((sum, e) => sum + (e.is_imputed ? 0 : e.roadwork_km), 0);
  const consistency = useMemo(() => {
     if (sortedEntries.length === 0) return 0;
     const present = sortedEntries.filter(e => !e.missed_day_flag).length;
     return Math.round((present / sortedEntries.length) * 100);
  }, [sortedEntries]);

  const latestWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight_kg : 0;
  const startWeight = sortedEntries.length > 0 ? sortedEntries[0].weight_kg : 0;
  const weightDiff = (latestWeight - startWeight).toFixed(1);

  // Chart Data Preparation
  const weightData = sortedEntries.map(e => ({
    date: e.date.substring(5), // MM-DD
    weight: e.weight_kg,
    imputed: e.is_imputed
  }));

  const trainingData = sortedEntries.slice(-14).map(e => ({
    date: e.date.substring(5),
    pushups: e.pushups_count,
    squats: e.squats_count
  }));

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <h3 className="text-slate-500 text-xs uppercase font-bold">Consistency</h3>
          <p className={`text-2xl font-bold ${consistency >= 80 ? 'text-emerald-400' : 'text-amber-500'}`}>
            {consistency}%
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <h3 className="text-slate-500 text-xs uppercase font-bold">Weight Change</h3>
          <p className={`text-2xl font-bold ${parseFloat(weightDiff) <= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} kg
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <h3 className="text-slate-500 text-xs uppercase font-bold">7-Day Run Vol</h3>
          <p className="text-2xl font-bold text-blue-400">
            {totalKm.toFixed(1)} km
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <h3 className="text-slate-500 text-xs uppercase font-bold">Days Logged</h3>
          <p className="text-2xl font-bold text-purple-400">
            {sortedEntries.length}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight Chart */}
        <div className="bg-slate-900 p-4 rounded border border-slate-800 h-80">
          <h3 className="text-slate-400 text-sm font-bold mb-4">Weight Progression</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.imputed) {
                        return <circle cx={cx} cy={cy} r={3} fill="#f59e0b" stroke="none" />;
                    }
                    return <circle cx={cx} cy={cy} r={3} fill="#10b981" stroke="none" />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="bg-slate-900 p-4 rounded border border-slate-800 h-80">
          <h3 className="text-slate-400 text-sm font-bold mb-4">Volume (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="pushups" fill="#3b82f6" stackId="a" name="Pushups" />
              <Bar dataKey="squats" fill="#8b5cf6" stackId="a" name="Squats" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Missed Days Alert */}
      {consistency < 70 && (
        <div className="bg-rose-900/20 border border-rose-800 p-4 rounded text-rose-200 text-sm flex items-center gap-3">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <span>Warning: Consistency is below 70%. You are failing your plan. Tighten up.</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;