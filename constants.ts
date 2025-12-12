import { PlanPhase } from './types';

export const APP_NAME = "IppoTracker 100";

export const PHASES: Record<number, PlanPhase> = {
  1: {
    name: "PHASE 1: FOUNDATION (Days 1-30)",
    description: "Walk/Jog 20-30m, Form focus.",
    roadwork_target: "2 km (Walk/Jog)",
    pushups_target: 30, // 3x10
    squats_target: 60,  // 3x20
    shadow_boxing_target: "3 rounds x 3 min",
  },
  2: {
    name: "PHASE 2: INTENSIFICATION (Days 31-60)",
    description: "2-3km Runs, increased volume.",
    roadwork_target: "2-3 km",
    pushups_target: 75, // approx 50-100 total
    squats_target: 100, // 3x35 approx
    shadow_boxing_target: "4 rounds x 3 min",
  },
  3: {
    name: "PHASE 3: FIGHTER CONDITIONING (Days 61-80)",
    description: "3-5km Runs, Intervals, Footwork.",
    roadwork_target: "3-5 km + Intervals",
    pushups_target: 110, // 100-120 total
    squats_target: 135, // 3x45 approx
    shadow_boxing_target: "4-5 rounds x 3 min",
  },
  4: {
    name: "PHASE 4: PEAK CONDITIONING (Days 81-100)",
    description: "4-6km Runs, Sprints, Peak volume.",
    roadwork_target: "4-6 km + Sprints",
    pushups_target: 135, // 120-150 total
    squats_target: 165, // 3x55 approx
    shadow_boxing_target: "5 rounds x 3 min",
  },
};

export const getPhaseForDay = (dayNum: number): PlanPhase => {
  if (dayNum <= 30) return PHASES[1];
  if (dayNum <= 60) return PHASES[2];
  if (dayNum <= 80) return PHASES[3];
  return PHASES[4];
};

export const INITIAL_BODY_STATS = {
  weight_kg: 82,
  waist_cm: 91.44, // 36 inches approx
  height_cm: 175, // 5'9"
};

export interface DayPlan {
  dayNum: number;
  workout: string;
  nutrition: string;
  isRest: boolean;
  phase: number;
  targets: {
      km: number;
      pushups: number;
      squats: number;
      rounds: number;
  }
}

const STRICT_DIET_PLAN = "Breakfast: 2 Eggs/Roti+Sabzi | Lunch: 2 Rotis+Dal+Sabzi | Snack: Fruit/Peanuts | Dinner: 2 Rotis+Dal+Sabzi (NO RICE) | 3-4L Water";

export const DIET_PROTOCOL = {
  breakfast: [
    "2–3 boiled eggs (best option)",
    "OR Poha/Upma (small portion)",
    "OR Leftover sabzi + 1 roti",
    "Avoid: biscuits, bread, sugar, tea"
  ],
  lunch: [
    "1–2 rotis (not 4–6)",
    "1 bowl dal",
    "1 bowl sabzi",
    "A little rice is okay if only 1 roti",
    "Avoid: frying, second servings"
  ],
  snack: [
    "1 fruit (banana, apple, papaya)",
    "OR handful chana/peanuts",
    "Avoid: biscuits, pakoda, samosa, chips"
  ],
  dinner: [
    "2 rotis OR 1 bowl rice",
    "Sabzi + Dal or Egg curry",
    "BEST OPTION: No rice at night",
    "Don’t eat after 9 PM"
  ],
  zero_rupee_rule: [
    "NO Soft drinks",
    "NO Chips/Biscuits",
    "NO Bread/Maggi",
    "NO Sweets/Fried snacks"
  ]
};

export const getPlanDetails = (dayNum: number): DayPlan => {
  const isRest = dayNum % 7 === 0;
  
  let phaseNum = 1;
  if (dayNum > 30) phaseNum = 2;
  if (dayNum > 60) phaseNum = 3;
  if (dayNum > 80) phaseNum = 4;

  let workoutText = "";
  let targets = { km: 0, pushups: 0, squats: 0, rounds: 0 };

  if (isRest) {
    workoutText = "Rest light if tired (Active Recovery)";
    targets = { km: 0, pushups: 0, squats: 0, rounds: 0 };
  } else {
    switch (phaseNum) {
      case 1:
        workoutText = "Walk/Jog 20–30 min | Push-ups 3×10–15, Squats 3×20–25, Plank 1–1.5 min | Shadow Boxing 3×3 min";
        targets = { km: 2, pushups: 45, squats: 75, rounds: 3 };
        break;
      case 2:
        workoutText = "Run 2–3 km | Push-ups 50–100 total, Squats 3×30–40, Plank 2 min | Shadow Boxing 4×3 min";
        targets = { km: 3, pushups: 75, squats: 105, rounds: 4 };
        break;
      case 3:
        workoutText = "Run 3–5 km (Intervals) | Push-ups 100–120 total, Squats 3×40–50, Plank 2–3 min | Shadow Boxing 4–5×3 min + Footwork";
        targets = { km: 4, pushups: 110, squats: 135, rounds: 5 };
        break;
      case 4:
        workoutText = "Run 4–6 km (Sprints) | Push-ups 120–150 total, Squats 3×50–60, Plank 3 min | Shadow Boxing 5×3 min";
        targets = { km: 5, pushups: 135, squats: 165, rounds: 5 };
        break;
    }
  }

  return {
    dayNum,
    workout: workoutText,
    nutrition: STRICT_DIET_PLAN,
    isRest,
    phase: phaseNum,
    targets
  };
};

export const MOTIVATIONAL_QUOTES = [
  "Discipline is doing what you hate to do, but doing it like you love it. - Tyson",
  "The only way to prove you are strong is to keep getting up. - Ippo",
  "Hard work betrays none, but dreams betray many. - Kamogawa",
  "He who is not courageous enough to take risks will accomplish nothing in life. - Ali",
  "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward. - Rocky",
  "Your body isn't stuck because you're poor — it's stuck because you eat more than you burn.",
];
