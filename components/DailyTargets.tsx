import React, { useState, useEffect } from 'react';
import { DailyEntry } from '../types';
import { getPlanDetails, DIET_PROTOCOL, PHASES, INITIAL_BODY_STATS } from '../constants';
import { createNewEntry, saveEntry, getEffectiveEntries } from '../services/storageService';

interface Props {
  selectedDate: string;
  dayNumber: number;
  existingEntry?: DailyEntry;
  onSave: () => void;
}

const DailyTargets: React.FC<Props> = ({ selectedDate, dayNumber, existingEntry, onSave }) => {
  const plan = getPlanDetails(dayNumber);
  const [weight, setWeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (existingEntry) {
      setWeight(existingEntry.weight_kg);
    } else {
        // Pre-fill last known weight
        const all = getEffectiveEntries();
        const dates = Object.keys(all).filter(d => d < selectedDate).sort();
        if (dates.length > 0) {
            setWeight(all[dates[dates.length - 1]].weight_kg);
        } else {
            setWeight(INITIAL_BODY_STATS.weight_kg);
        }
    }
  }, [existingEntry, selectedDate]);

  const handleComplete = () => {
    if (!confirm(`Mark Day ${dayNumber} as complete? (Targets met, Strict Diet followed)`)) return;

    // Create perfect entry based on plan targets
    // Weight is auto-filled from history or initial stats
    const entry = createNewEntry(selectedDate, {
        weight_kg: weight || INITIAL_BODY_STATS.weight_kg,
        roadwork_km: plan.targets.km,
        roadwork_time_min: plan.targets.km * 6,
        pushups_count: plan.targets.pushups,
        squats_count: plan.targets.squats,
        boxing_rounds: plan.targets.rounds,
        diet_compliance_pct: 100,
        water_liters: 3.5,
        sleep_hours: 8,
        energy_level: 4,
        discipline_score: 10,
        notes: "Daily targets met.",
        missed_day_flag: false,
        is_imputed: false
    }, existingEntry, !!existingEntry);

    saveEntry(entry);
    onSave();
  };

  const isDone = existingEntry && !existingEntry.missed_day_flag && !existingEntry.is_imputed;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">
             Phase {plan.phase}: {PHASES[plan.phase]?.name.split(':')[1]}
           </div>
           <h2 className="text-3xl font-bold text-white">Day {dayNumber}</h2>
           <p className="text-slate-500 text-sm font-mono">{selectedDate}</p>
        </div>
        <div className="text-right">
             {isDone ? (
                 <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-3 py-2 rounded text-xs font-bold uppercase flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     Mission Complete
                 </span>
             ) : (
                 <button 
                    onClick={handleComplete}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/30 transition-transform active:scale-95 flex items-center gap-2"
                 >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Mark Done
                 </button>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WORKOUT CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-400 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Training Protocol
            </h3>
            <div className="bg-slate-950 p-4 rounded border border-slate-800 text-slate-200 font-medium text-sm leading-relaxed">
                {plan.workout}
            </div>
            {plan.isRest && (
                <p className="mt-3 text-xs text-slate-500 italic">
                    * Active recovery only. Stretch, foam roll, walk.
                </p>
            )}
        </div>

        {/* DIET CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-400 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Nutrition Protocol
            </h3>
            <div className="space-y-4">
                <DietSection title="Breakfast" items={DIET_PROTOCOL.breakfast} />
                <DietSection title="Lunch" items={DIET_PROTOCOL.lunch} />
                <DietSection title="Snack" items={DIET_PROTOCOL.snack} />
                <DietSection title="Dinner" items={DIET_PROTOCOL.dinner} />
                
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-rose-500 text-xs font-bold uppercase mb-2">The Zero-Rupee Rule (BANNED)</h4>
                    <ul className="grid grid-cols-2 gap-2">
                        {DIET_PROTOCOL.zero_rupee_rule.map((item, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="text-rose-800">✖</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

const DietSection: React.FC<{title: string, items: string[]}> = ({title, items}) => (
    <div>
        <h4 className="text-xs text-slate-400 font-bold uppercase mb-1">{title}</h4>
        <ul className="text-sm text-slate-300 space-y-0.5">
            {items.map((item, i) => (
                <li key={i} className={`pl-2 border-l-2 ${item.includes('Avoid') ? 'border-rose-800 text-rose-300/70 text-xs' : 'border-emerald-800'}`}>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default DailyTargets;
