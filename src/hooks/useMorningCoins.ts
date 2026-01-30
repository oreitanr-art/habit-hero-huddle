import { useState, useEffect, useCallback, useMemo } from "react";
import { Store } from "@/lib/morning-coins/types";
import { loadStore, saveStore, resetStore as resetStoreData } from "@/lib/morning-coins/storage";
import { toISODate, getWeekKey, isFriday, isSaturday } from "@/lib/morning-coins/date-utils";
import { 
  toggleTask as toggleTaskLogic, 
  computeTodayEarnedFromTasks,
  buyReward as buyRewardLogic,
  getCompletedDaysInWeek,
  isPerfectWeek,
} from "@/lib/morning-coins/logic";

export function useMorningCoins() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Current date info
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => toISODate(now), [now]);
  const weekKey = useMemo(() => getWeekKey(now), [now]);
  const isShopDay = useMemo(() => isFriday(now) || isSaturday(now), [now]);

  // Load store on mount
  useEffect(() => {
    const loaded = loadStore();
    setStore(loaded);
    setIsLoading(false);
  }, []);

  // Persist store changes
  useEffect(() => {
    if (store) {
      saveStore(store);
    }
  }, [store]);

  // Get today's status
  const todayStatus = useMemo(() => {
    if (!store) return null;
    return store.dailyByDate[today] ?? null;
  }, [store, today]);

  const completedTaskIds = useMemo(() => {
    return new Set(todayStatus?.completedTaskIds ?? []);
  }, [todayStatus]);

  const todayEarned = useMemo(() => {
    if (!store) return 0;
    return computeTodayEarnedFromTasks(store, now);
  }, [store, now]);

  const weeklyCoins = useMemo(() => {
    if (!store) return 0;
    return store.weeklyCoinsByWeekKey[weekKey] ?? 0;
  }, [store, weekKey]);

  const completedDaysThisWeek = useMemo(() => {
    if (!store) return 0;
    return getCompletedDaysInWeek(store, weekKey);
  }, [store, weekKey]);

  const hasPerfectWeek = useMemo(() => {
    if (!store) return false;
    return isPerfectWeek(store, weekKey);
  }, [store, weekKey]);

  const allTasksCompleted = useMemo(() => {
    if (!store) return false;
    return completedTaskIds.size === store.tasks.length;
  }, [store, completedTaskIds]);

  // Actions
  const toggleTask = useCallback((taskId: string) => {
    if (!store) return;
    const newStore = toggleTaskLogic(store, taskId, now);
    setStore(newStore);
  }, [store, now]);

  const buyReward = useCallback((rewardId: string): { ok: boolean; reason?: string } => {
    if (!store) return { ok: false, reason: "לא נטען" };
    const result = buyRewardLogic(store, rewardId, now);
    if (result.ok) {
      setStore(result.store);
    }
    return { ok: result.ok, reason: result.reason };
  }, [store, now]);

  const updateStore = useCallback((updater: (s: Store) => Store) => {
    if (!store) return;
    setStore(updater(store));
  }, [store]);

  const resetStore = useCallback(() => {
    resetStoreData();
    setStore(loadStore());
  }, []);

  return {
    store,
    isLoading,
    today,
    weekKey,
    isShopDay,
    todayStatus,
    completedTaskIds,
    todayEarned,
    weeklyCoins,
    completedDaysThisWeek,
    hasPerfectWeek,
    allTasksCompleted,
    toggleTask,
    buyReward,
    updateStore,
    resetStore,
  };
}
