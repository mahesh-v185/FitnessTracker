import { DailyEntry } from '../types';
import { INITIAL_BODY_STATS } from '../constants';

const STORAGE_KEY = 'ippo_tracker_v1';

// Helper to generate UUID
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper: Format date YYYY-MM-DD
const formatDate = (d: Date): string => d.toISOString().split('T')[0];

export const getRawEntries = (): DailyEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveEntry = (entry: DailyEntry) => {
  const entries = getRawEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const createNewEntry = (
  date: string,
  data: Partial<DailyEntry>,
  previousEntry?: DailyEntry,
  isEdit = false
): DailyEntry => {
  return {
    id: uuidv4(),
    date,
    version_number: isEdit && previousEntry ? previousEntry.version_number + 1 : 1,
    created_at: new Date().toISOString(),
    edited_at: isEdit ? new Date().toISOString() : null,
    created_by: 'user',
    
    weight_kg: data.weight_kg ?? (previousEntry?.weight_kg || INITIAL_BODY_STATS.weight_kg),
    waist_cm: data.waist_cm ?? (previousEntry?.waist_cm || INITIAL_BODY_STATS.waist_cm),
    
    roadwork_km: data.roadwork_km ?? 0,
    roadwork_time_min: data.roadwork_time_min ?? 0,
    pushups_count: data.pushups_count ?? 0,
    squats_count: data.squats_count ?? 0,
    plank_sec: data.plank_sec ?? 0,
    boxing_rounds: data.boxing_rounds ?? 0,
    boxing_minutes: data.boxing_minutes ?? 0,
    
    diet_compliance_pct: data.diet_compliance_pct ?? 0,
    water_liters: data.water_liters ?? 0,
    sleep_hours: data.sleep_hours ?? 0,
    energy_level: data.energy_level ?? 3,
    discipline_score: data.discipline_score ?? 5,

    missed_day_flag: false,
    is_imputed: false,
    carry_forward_from_date: null,
    notes: data.notes ?? '',
  };
};

// Core logic: Collapse append-only log into "Effective" state (latest version per day)
export const getEffectiveEntries = (): Record<string, DailyEntry> => {
  const raw = getRawEntries();
  const effective: Record<string, DailyEntry> = {};

  // Sort by date ASC, then version ASC
  raw.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.version_number - b.version_number;
  });

  raw.forEach(entry => {
    effective[entry.date] = entry;
  });

  return effective;
};

// Auto-Imputation Logic
export const checkAndImputeMissingDays = () => {
  const effective = getEffectiveEntries();
  const sortedDates = Object.keys(effective).sort();
  
  if (sortedDates.length === 0) return; // No start date yet, nothing to fill

  const firstDate = new Date(sortedDates[0]);
  const today = new Date();
  
  // Iterate from first log day until yesterday
  // We do not impute "Today" until tomorrow
  const cursor = new Date(firstDate);
  const rawEntriesToAdd: DailyEntry[] = [];
  const existingRaw = getRawEntries();

  while (cursor < today) {
    const dateStr = formatDate(cursor);
    // If today is actually today (local time), stop. We don't impute the current day mid-day.
    if (dateStr === formatDate(today)) break;

    if (!effective[dateStr]) {
      // Missing! Find last known values for carry forward
      let lastWeight = INITIAL_BODY_STATS.weight_kg;
      let lastWaist = INITIAL_BODY_STATS.waist_cm;
      let carryFrom = null;

      // Look backwards for data
      const prevDate = new Date(cursor);
      prevDate.setDate(prevDate.getDate() - 1);
      
      // Simple lookback (in a real app, optimize this search)
      // Here we just use the 'effective' map which might have gaps, so we need to find the nearest previous key
      const prevKeys = Object.keys(effective).filter(d => d < dateStr).sort();
      if (prevKeys.length > 0) {
        const lastKey = prevKeys[prevKeys.length - 1];
        const lastEntry = effective[lastKey];
        lastWeight = lastEntry.weight_kg;
        lastWaist = lastEntry.waist_cm;
        carryFrom = lastKey;
      }

      const imputedEntry: DailyEntry = {
        id: uuidv4(),
        date: dateStr,
        version_number: 1,
        created_at: new Date().toISOString(),
        edited_at: null,
        created_by: 'system',
        
        weight_kg: lastWeight,
        waist_cm: lastWaist,
        
        roadwork_km: 0,
        roadwork_time_min: 0,
        pushups_count: 0,
        squats_count: 0,
        plank_sec: 0,
        boxing_rounds: 0,
        boxing_minutes: 0,
        
        diet_compliance_pct: 0,
        water_liters: 0,
        sleep_hours: 0,
        energy_level: 1,
        discipline_score: 1,

        missed_day_flag: true,
        is_imputed: true,
        carry_forward_from_date: carryFrom,
        notes: 'Auto-generated missed day',
      };
      
      rawEntriesToAdd.push(imputedEntry);
      effective[dateStr] = imputedEntry; // Update effective map for next iteration's lookback
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (rawEntriesToAdd.length > 0) {
    const newStore = [...existingRaw, ...rawEntriesToAdd];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
    console.log(`Imputed ${rawEntriesToAdd.length} missing days.`);
  }
};

export const nukeStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
