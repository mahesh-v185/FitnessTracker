import React, { useState, useEffect } from 'react';
import { DailyEntry } from '../types';
import { createNewEntry, saveEntry, getEffectiveEntries } from '../services/storageService';
import { getPhaseForDay } from '../constants';

interface Props {
  selectedDate: string;
  existingEntry?: DailyEntry;
  onSave: () => void;
  dayNumber: number;
}

const DailyForm: React.FC<Props> = ({ selectedDate, existingEntry, onSave, dayNumber }) => {
  const [formData, setFormData] = useState<Partial<DailyEntry>>({});
  const phase = getPhaseForDay(dayNumber);

  useEffect(() => {
    if (existingEntry) {
      setFormData(existingEntry);
    } else {
      // Pre-fill weight/waist from previous day if available
      const all = getEffectiveEntries();
      // Find latest date before selectedDate
      const dates = Object.keys(all).filter(d => d < selectedDate).sort();
      const lastKey = dates[dates.length - 1];
      const lastEntry = all[lastKey];

      setFormData({
        weight_kg: lastEntry?.weight_kg || undefined,
        waist_cm: lastEntry?.waist_cm || undefined,
        roadwork_km: 0,
        pushups_count: 0,
        squats_count: 0,
        boxing_rounds: 0,
        diet_compliance_pct: 100,
        water_liters: 0,
        sleep_hours: 0,
        energy_level: 3,
        discipline_score: 5,
        notes: '',
      });
    }
  }, [selectedDate, existingEntry]);

  const handleChange = (field: keyof DailyEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = createNewEntry(selectedDate, formData, existingEntry, !!existingEntry);
    saveEntry(entry);
    onSave();
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-400 uppercase tracking-wider">
          Daily Log: {selectedDate}
        </h2>
        <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-400">
          Day {dayNumber} • {phase.name}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-800/50 p-4 rounded border border-slate-700/50">
        <div className="col-span-1 md:col-span-2 text-sm text-slate-400 font-mono">
          <span className="text-amber-500 font-bold">TODAY'S TARGETS:</span> {phase.roadwork_target} Run, {phase.pushups_target} Pushups, {phase.squats_target} Squats, {phase.shadow_boxing_target}.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Body Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
            <input 
              type="number" step="0.1" 
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
              value={formData.weight_kg || ''}
              onChange={e => handleChange('weight_kg', parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waist (cm)</label>
            <input 
              type="number" step="0.1"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
              value={formData.waist_cm || ''}
              onChange={e => handleChange('waist_cm', parseFloat(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Section 2: Training Volume */}
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Training Volume</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Roadwork (km)</label>
              <input type="number" step="0.1"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.roadwork_km || 0}
                onChange={e => handleChange('roadwork_km', parseFloat(e.target.value))}
              />
            </div>
             <div>
              <label className="block text-xs text-slate-500 mb-1">Duration (min)</label>
              <input type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.roadwork_time_min || 0}
                onChange={e => handleChange('roadwork_time_min', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Pushups</label>
              <input type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.pushups_count || 0}
                onChange={e => handleChange('pushups_count', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Squats</label>
              <input type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.squats_count || 0}
                onChange={e => handleChange('squats_count', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Plank (sec)</label>
              <input type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.plank_sec || 0}
                onChange={e => handleChange('plank_sec', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Boxing Rounds</label>
              <input type="number"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.boxing_rounds || 0}
                onChange={e => handleChange('boxing_rounds', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Recovery & Discipline */}
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Discipline & Recovery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Diet Compl. (%)</label>
              <input type="number" max="100"
                className={`w-full bg-slate-950 border rounded p-2 ${
                    (formData.diet_compliance_pct || 0) < 80 ? 'border-rose-800 text-rose-500' : 'border-slate-700 text-emerald-400'
                }`}
                value={formData.diet_compliance_pct || 0}
                onChange={e => handleChange('diet_compliance_pct', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Water (L)</label>
              <input type="number" step="0.1"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.water_liters || 0}
                onChange={e => handleChange('water_liters', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sleep (hr)</label>
              <input type="number" step="0.5"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.sleep_hours || 0}
                onChange={e => handleChange('sleep_hours', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Energy (1-5)</label>
              <input type="number" min="1" max="5"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                value={formData.energy_level || 3}
                onChange={e => handleChange('energy_level', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Notes */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Training Notes</label>
          <textarea 
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 h-24 focus:border-emerald-500 focus:outline-none text-sm"
            placeholder="How was the session? Be honest."
            value={formData.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded uppercase tracking-widest transition-colors shadow-lg shadow-emerald-900/20"
        >
          {existingEntry ? (existingEntry.is_imputed ? "Convert Missed to Active" : "Update Log") : "Log Workout"}
        </button>
      </form>
    </div>
  );
};

export default DailyForm;
