import { Store, DailyStatus } from "./types";
import { toISODate, getWeekKey, getSchoolDaysForWeek } from "./date-utils";

// Ensure daily status exists for a date
export function ensureDaily(store: Store, date: string): Store {
  if (store.dailyByDate[date]) return store;
  return {
    ...store,
    dailyByDate: {
      ...store.dailyByDate,
      [date]: { date, completedTaskIds: [], allDoneBonusApplied: false },
    },
  };
}

// Toggle a task's completion status
export function toggleTask(store: Store, taskId: string, now: Date): Store {
  const date = toISODate(now);
  const weekKey = getWeekKey(now);
  let newStore = ensureDaily(store, date);
  const day = newStore.dailyByDate[date];
  const task = newStore.tasks.find((t) => t.id === taskId);
  
  if (!task) return store;

  const wasCompleted = day.completedTaskIds.includes(taskId);
  const newCompleted = wasCompleted
    ? day.completedTaskIds.filter((id) => id !== taskId)
    : [...day.completedTaskIds, taskId];

  // Calculate coin change
  const coinDelta = wasCompleted ? -task.coins : task.coins;
  const newWallet = Math.max(0, newStore.walletCoins + coinDelta);
  const currentWeekCoins = newStore.weeklyCoinsByWeekKey[weekKey] ?? 0;
  const newWeekCoins = Math.max(0, currentWeekCoins + coinDelta);

  newStore = {
    ...newStore,
    walletCoins: newWallet,
    weeklyCoinsByWeekKey: {
      ...newStore.weeklyCoinsByWeekKey,
      [weekKey]: newWeekCoins,
    },
    dailyByDate: {
      ...newStore.dailyByDate,
      [date]: { ...day, completedTaskIds: newCompleted },
    },
  };

  // Check for all-done bonus
  return applyAllDoneBonusIfEligible(newStore, now);
}

// Apply the "all tasks done" daily bonus
export function applyAllDoneBonusIfEligible(store: Store, now: Date): Store {
  const date = toISODate(now);
  const weekKey = getWeekKey(now);
  const day = store.dailyByDate[date];
  
  if (!day) return store;

  const allDone = day.completedTaskIds.length === store.tasks.length;
  
  if (!allDone || day.allDoneBonusApplied) return store;

  const bonus = store.settings.bonuses.allDoneDailyBonus;
  const newWallet = store.walletCoins + bonus;
  const currentWeekCoins = store.weeklyCoinsByWeekKey[weekKey] ?? 0;
  const newWeekCoins = currentWeekCoins + bonus;

  // Update streak
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toISODate(yesterday);
  
  let newStreak = 1;
  if (store.streak.lastAllDoneDate === yesterdayStr) {
    newStreak = store.streak.current + 1;
  }

  let streakBonus = 0;
  if (newStreak === 3) {
    streakBonus = store.settings.bonuses.threeDayStreakBonus;
  }

  return {
    ...store,
    walletCoins: newWallet + streakBonus,
    weeklyCoinsByWeekKey: {
      ...store.weeklyCoinsByWeekKey,
      [weekKey]: newWeekCoins + streakBonus,
    },
    dailyByDate: {
      ...store.dailyByDate,
      [date]: { ...day, allDoneBonusApplied: true },
    },
    streak: {
      current: newStreak,
      lastAllDoneDate: date,
    },
  };
}

// Compute coins earned today from tasks
export function computeTodayEarnedFromTasks(store: Store, now: Date): number {
  const date = toISODate(now);
  const day = store.dailyByDate[date];
  if (!day) return 0;
  
  const completedSet = new Set(day.completedTaskIds);
  return store.tasks.reduce((sum, t) => 
    completedSet.has(t.id) ? sum + t.coins : sum, 0
  );
}

// Check if a week is "perfect" (all 5 school days completed all tasks)
export function isPerfectWeek(store: Store, weekKey: string): boolean {
  const schoolDays = getSchoolDaysForWeek(weekKey);
  return schoolDays.every((date) => {
    const day = store.dailyByDate[date];
    return day && day.allDoneBonusApplied;
  });
}

// Count completed days in a week
export function getCompletedDaysInWeek(store: Store, weekKey: string): number {
  const schoolDays = getSchoolDaysForWeek(weekKey);
  return schoolDays.filter((date) => {
    const day = store.dailyByDate[date];
    return day && day.allDoneBonusApplied;
  }).length;
}

// Buy a reward
export function buyReward(
  store: Store, 
  rewardId: string, 
  now: Date
): { ok: boolean; store: Store; reason?: string } {
  const weekKey = getWeekKey(now);
  const weeklyCoins = store.weeklyCoinsByWeekKey[weekKey] ?? 0;
  const reward = store.rewards.find((r) => r.id === rewardId);
  
  if (!reward) {
    return { ok: false, store, reason: "פרס לא נמצא" };
  }

  if (reward.requiresPerfectWeek && !isPerfectWeek(store, weekKey)) {
    return { ok: false, store, reason: "נדרש שבוע מושלם (5 ימים מלאים)" };
  }

  if (weeklyCoins < reward.cost) {
    return { ok: false, store, reason: "אין מספיק מטבעות השבוע" };
  }

  const newWeeklyCoins = weeklyCoins - reward.cost;
  const newWallet = Math.max(0, store.walletCoins - reward.cost);

  return {
    ok: true,
    store: {
      ...store,
      walletCoins: newWallet,
      weeklyCoinsByWeekKey: {
        ...store.weeklyCoinsByWeekKey,
        [weekKey]: newWeeklyCoins,
      },
    },
  };
}

// Apply end-of-day penalty (called when starting a new day)
export function applyPenaltyForDate(
  store: Store, 
  date: string, 
  weekKey: string
): Store {
  const day = store.dailyByDate[date];
  if (!day || day.penaltyApplied) return store;

  const count = day.completedTaskIds.length;
  let penalty = 0;
  
  if (count === 0) {
    penalty = store.settings.penalties.zeroTasks;
  } else if (count >= 1 && count <= 4) {
    penalty = store.settings.penalties.oneToFour;
  }

  if (penalty === 0) {
    return {
      ...store,
      dailyByDate: {
        ...store.dailyByDate,
        [date]: { ...day, penaltyApplied: true },
      },
    };
  }

  const newWallet = Math.max(0, store.walletCoins + penalty);
  const currentWeekCoins = store.weeklyCoinsByWeekKey[weekKey] ?? 0;
  const newWeekCoins = Math.max(0, currentWeekCoins + penalty);

  return {
    ...store,
    walletCoins: newWallet,
    weeklyCoinsByWeekKey: {
      ...store.weeklyCoinsByWeekKey,
      [weekKey]: newWeekCoins,
    },
    dailyByDate: {
      ...store.dailyByDate,
      [date]: { ...day, penaltyApplied: true },
    },
  };
}

// Apply perfect week bonus
export function applyPerfectWeekBonus(store: Store, weekKey: string): Store {
  if (!isPerfectWeek(store, weekKey)) return store;
  
  const bonus = store.settings.bonuses.perfectWeekBonus;
  const currentWeekCoins = store.weeklyCoinsByWeekKey[weekKey] ?? 0;
  
  return {
    ...store,
    walletCoins: store.walletCoins + bonus,
    weeklyCoinsByWeekKey: {
      ...store.weeklyCoinsByWeekKey,
      [weekKey]: currentWeekCoins + bonus,
    },
  };
}
