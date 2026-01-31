// Morning Coins - Type definitions

export interface Task {
  id: string;
  title: string;
  coins: number;
  icon: string; // Emoji icon
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
  requiresPerfectWeek?: boolean;
}

export interface Bonuses {
  allDoneDailyBonus: number;
  threeDayStreakBonus: number;
  perfectWeekBonus: number;
}

export interface Penalties {
  zeroTasks: number;   // negative value like -10
  oneToFour: number;   // negative value like -5
}

export interface Settings {
  pin: string;
  bonuses: Bonuses;
  penalties: Penalties;
}

export interface DailyStatus {
  date: string; // YYYY-MM-DD
  completedTaskIds: string[];
  allDoneBonusApplied: boolean;
  penaltyApplied?: boolean;
  submittedAt?: string; // ISO timestamp - when set, day is locked
}

export interface Streak {
  current: number;
  lastAllDoneDate?: string;
}

export interface Store {
  tasks: Task[];
  rewards: Reward[];
  settings: Settings;
  walletCoins: number;
  weeklyCoinsByWeekKey: Record<string, number>;
  dailyByDate: Record<string, DailyStatus>;
  streak: Streak;
}
