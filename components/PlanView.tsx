import React, { useRef, useEffect } from 'react';
import { DailyEntry } from '../types';
import { getPlanDetails, MOTIVATIONAL_QUOTES } from '../constants';
import { createNewEntry, saveEntry, getEffectiveEntries } from '../services/storageService';

interface Props {
  entries: Record<string, DailyEntry>;
  currentDayNumber: number;
  onUpdate: () => void;
}

const PlanView: React.FC<Props> = ({ entries, currentDayNumber, onUpdate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current day on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleMarkDone = (dayNum: number, dateStr: string) => {
    if (!confirm(`Mark Day ${dayNum} as SUCCESSFULLY completed? This will log a perfect score for today.`)) return;

    const plan = getPlanDetails(dayNum);
    const effective = getEffectiveEntries();
    
    // Find previous entry for weight carry-forward
    const dates = Object.keys(effective).filter(d => d < dateStr).sort();
    const lastKey = dates[dates.length - 1];
    const lastEntry = effective[lastKey];

    // Create entry with perfect targets
    const newEntry = createNewEntry(dateStr, {
      weight_kg: lastEntry?.weight_kg,
      waist_cm: lastEntry?.waist_cm,
      roadwork_km: plan.targets.km,
      roadwork_time_min: plan.targets.km * 6, // approx 6 min/km
      pushups_count: plan.targets.pushups,
      squats_count: plan.targets.squats,
      boxing_rounds: plan.targets.rounds,
      boxing_minutes: plan.targets.rounds * 3,
      diet_compliance_pct: 100,
      water_liters: 3.5,
      sleep_hours: 7.5,
      energy_level: 4,
      discipline_score: 10,
      notes: `Plan Day ${dayNum} completed via Quick Log.`,
    }, undefined, false); // Not an edit, new log

    saveEntry(newEntry);
    onUpdate();
  };

  // Generate date string for a specific day number
  const getDateForDayNum = (dayNum: number) => {
    const sorted = Object.keys(entries).sort();
    const startDate = sorted.length > 0 ? new Date(sorted[0]) : new Date();
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (dayNum - 1));
    return targetDate.toISOString().split('T')[0];
  };

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 text-center">
        <h2 className="text-xl font-bold text-emerald-400 mb-2 uppercase tracking-widest">The 100-Day Path</h2>
        <p className="text-sm text-slate-400 italic">"{quote}"</p>
        <div className="mt-4 w-full bg-slate-800 rounded-full h-2.5">
          <div 
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min((currentDayNumber / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-right mt-1 text-slate-500">{currentDayNumber}/100 Days</p>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto relative">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((day) => {
            const plan = getPlanDetails(day);
            const dateStr = getDateForDayNum(day);
            const entry = entries[dateStr];
            const isDone = entry && !entry.missed_day_flag && !entry.is_imputed;
            const isMissed = entry && (entry.missed_day_flag || entry.is_imputed);
            const isToday = day === currentDayNumber;
            const isLocked = day > currentDayNumber;

            return (
              <div 
                key={day} 
                ref={isToday ? scrollRef : null}
                className={`p-4 border-b border-slate-800 flex flex-col gap-3 transition-colors
                  ${isToday ? 'bg-emerald-950/20 border-l-4 border-l-emerald-500' : 'hover:bg-slate-800/30'}
                  ${isLocked ? 'opacity-50 grayscale' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isToday ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      DAY {day}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{dateStr}</span>
                    {plan.isRest && <span className="text-xs bg-blue-900 text-blue-200 px-2 rounded">REST</span>}
                  </div>
                  
                   <div className="min-w-[100px] flex justify-end">
                      {isDone ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>DONE</span>
                        </div>
                      ) : isMissed ? (
                        <div className="flex flex-col items-end">
                            <span className="text-rose-500 font-bold text-xs">MISSED</span>
                            <button onClick={() => handleMarkDone(day, dateStr)} className="text-[10px] text-slate-400 underline">Redeem</button>
                        </div>
                      ) : isLocked ? (
                        <span className="text-xs text-slate-600 font-mono">LOCKED</span>
                      ) : (
                        <button 
                          onClick={() => handleMarkDone(day, dateStr)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded"
                        >
                          MARK DONE
                        </button>
                      )}
                   </div>
                </div>

                <div className="bg-slate-950/50 p-2 rounded border border-slate-800/50 text-sm space-y-2 font-mono text-slate-300">
                    <div className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">WORKOUT:</span>
                        <span>{plan.workout}</span>
                    </div>
                    <div className="flex items-start gap-2 border-t border-slate-800 pt-2 mt-1">
                        <span className="text-amber-500 font-bold">DIET:</span>
                        <span>{plan.nutrition}</span>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanView;
