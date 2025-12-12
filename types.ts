export interface DailyEntry {
  id: string; // UUID
  date: string; // YYYY-MM-DD
  version_number: number;
  created_at: string; // ISO Timestamp
  edited_at: string | null;
  created_by: string; // 'user' | 'system'

  // Metrics
  weight_kg: number;
  waist_cm: number;
  roadwork_km: number;
  roadwork_time_min: number;
  pushups_count: number;
  squats_count: number;
  plank_sec: number;
  boxing_rounds: number;
  boxing_minutes: number;
  
  // Health & Compliance
  diet_compliance_pct: number;
  water_liters: number;
  sleep_hours: number;
  energy_level: number; // 1-5
  discipline_score: number; // 1-10

  // Flags
  missed_day_flag: boolean;
  is_imputed: boolean;
  carry_forward_from_date: string | null;
  
  notes: string;
}

export interface PlanPhase {
  name: string;
  description: string;
  roadwork_target: string;
  pushups_target: number;
  squats_target: number;
  shadow_boxing_target: string;
}

export interface WeeklyStats {
  weekStart: string;
  totalKm: number;
  totalPushups: number;
  totalMinutesTrained: number;
  avgDietCompliance: number;
  weightChange: number;
  waistChange: number;
  consistencyPct: number;
}
