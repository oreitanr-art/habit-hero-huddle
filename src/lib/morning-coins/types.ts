// Morning Coins - Type definitions

export type TaskPeriod = 'morning' | 'evening';

export interface Task {
  id: string;
  title: string;
  coins: number;
  icon: string; // Emoji icon
  taskPeriod: TaskPeriod;
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
  completedEveningTaskIds: string[];
  allDoneBonusApplied: boolean;
  eveningAllDoneBonusApplied: boolean;
  penaltyApplied?: boolean;
  eveningPenaltyApplied?: boolean;
  submittedAt?: string; // ISO timestamp - when set, morning is locked
  eveningSubmittedAt?: string; // ISO timestamp - when set, evening is locked
}

export interface Streak {
  current: number;
  lastAllDoneDate?: string;
}

export interface Store {
  tasks: Task[]; // All tasks (morning + evening)
  rewards: Reward[];
  settings: Settings;
  walletCoins: number;
  weeklyCoinsByWeekKey: Record<string, number>;
  dailyByDate: Record<string, DailyStatus>;
  streak: Streak;
}
