// Типы для базы данных

export interface UserData {
  user_id: number;
  first_name: string;
  username?: string;
  balance: number;
  level: number;
  experience: number;
  tasks_completed: number;
  referrals_count: number;
  referred_by?: number;
  created_at: string;
  last_active: string;
}

export interface TaskData {
  id: number;
  title: string;
  description: string;
  reward: number;
  type: "social" | "daily" | "special";
  action_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserTask {
  user_id: number;
  task_id: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ReferralData {
  referrer_id: number;
  referred_id: number;
  reward_claimed: boolean;
  created_at: string;
}

export const TASK_TYPES = {
  SOCIAL: "social",
  DAILY: "daily",
  SPECIAL: "special",
} as const;

export const REWARDS = {
  REFERRAL: 500,
  DAILY_LOGIN: 100,
} as const;

export const LEVELS = [
  { level: 1, required_exp: 0 },
  { level: 2, required_exp: 500 },
  { level: 3, required_exp: 1000 },
  { level: 4, required_exp: 2000 },
  { level: 5, required_exp: 3000 },
  { level: 6, required_exp: 5000 },
  { level: 7, required_exp: 7500 },
  { level: 8, required_exp: 10000 },
  { level: 9, required_exp: 15000 },
  { level: 10, required_exp: 20000 },
];

export function calculateLevel(experience: number): { level: number; nextLevelExp: number; currentLevelExp: number } {
  let level = 1;
  let nextLevelExp = 500;
  let currentLevelExp = 0;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (experience >= LEVELS[i].required_exp) {
      level = LEVELS[i].level;
      currentLevelExp = LEVELS[i].required_exp;
      nextLevelExp = LEVELS[i + 1]?.required_exp || LEVELS[i].required_exp;
      break;
    }
  }

  return { level, nextLevelExp, currentLevelExp };
}
