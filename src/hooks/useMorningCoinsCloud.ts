// Morning Coins Cloud Hook - connects to Supabase backend
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Store, Task, Reward, Settings, DailyStatus, Streak, Bonuses, Penalties } from "@/lib/morning-coins/types";
import { getTodayKey, getWeekKey, isShopDay as checkIsShopDay } from "@/lib/morning-coins/date-utils";
import { DEFAULT_STORE } from "@/lib/morning-coins/defaults";

interface ChildSettings {
  pin: string;
  bonus_all_done: number;
  bonus_three_day_streak: number;
  bonus_perfect_week: number;
  penalty_zero_tasks: number;
  penalty_one_to_four: number;
}

interface ChildTask {
  id: string;
  title: string;
  coins: number;
  icon: string;
  sort_order: number;
}

interface ChildReward {
  id: string;
  title: string;
  cost: number;
  icon: string;
  requires_perfect_week: boolean;
  sort_order: number;
}

interface ChildDailyProgress {
  date: string;
  completed_task_ids: string[];
  all_done_bonus_applied: boolean;
  penalty_applied: boolean;
}

export function useMorningCoinsCloud() {
  const { selectedChild, refreshChildren } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShopDay, setIsShopDay] = useState(checkIsShopDay());

  // Load data from database
  const loadData = useCallback(async () => {
    if (!selectedChild) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all data in parallel
      const [settingsRes, tasksRes, rewardsRes, progressRes, weeklyCoinsRes] = await Promise.all([
        supabase.from("child_settings").select("*").eq("child_id", selectedChild.id).single(),
        supabase.from("child_tasks").select("*").eq("child_id", selectedChild.id).order("sort_order"),
        supabase.from("child_rewards").select("*").eq("child_id", selectedChild.id).order("sort_order"),
        supabase.from("child_daily_progress").select("*").eq("child_id", selectedChild.id),
        supabase.from("child_weekly_coins").select("*").eq("child_id", selectedChild.id),
      ]);

      const settings: ChildSettings = settingsRes.data || {
        pin: "1234",
        bonus_all_done: 5,
        bonus_three_day_streak: 10,
        bonus_perfect_week: 20,
        penalty_zero_tasks: -10,
        penalty_one_to_four: -5,
      };

      const tasks: Task[] = (tasksRes.data || []).map((t: ChildTask) => ({
        id: t.id,
        title: t.title,
        coins: t.coins,
        icon: t.icon,
      }));

      const rewards: Reward[] = (rewardsRes.data || []).map((r: ChildReward) => ({
        id: r.id,
        title: r.title,
        cost: r.cost,
        icon: r.icon,
        requiresPerfectWeek: r.requires_perfect_week,
      }));

      const dailyByDate: Record<string, DailyStatus> = {};
      (progressRes.data || []).forEach((p: ChildDailyProgress) => {
        dailyByDate[p.date] = {
          date: p.date,
          completedTaskIds: p.completed_task_ids || [],
          allDoneBonusApplied: p.all_done_bonus_applied,
          penaltyApplied: p.penalty_applied,
        };
      });

      const weeklyCoinsByWeekKey: Record<string, number> = {};
      (weeklyCoinsRes.data || []).forEach((w: { week_key: string; coins: number }) => {
        weeklyCoinsByWeekKey[w.week_key] = w.coins;
      });

      const storeData: Store = {
        tasks,
        rewards,
        settings: {
          pin: settings.pin,
          bonuses: {
            allDoneDailyBonus: settings.bonus_all_done,
            threeDayStreakBonus: settings.bonus_three_day_streak,
            perfectWeekBonus: settings.bonus_perfect_week,
          },
          penalties: {
            zeroTasks: settings.penalty_zero_tasks,
            oneToFour: settings.penalty_one_to_four,
          },
        },
        walletCoins: selectedChild.wallet_coins,
        weeklyCoinsByWeekKey,
        dailyByDate,
        streak: {
          current: selectedChild.streak_current,
          lastAllDoneDate: selectedChild.streak_last_all_done_date || undefined,
        },
      };

      setStore(storeData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle task completion
  const toggleTask = useCallback(async (taskId: string) => {
    if (!selectedChild || !store) return;

    const todayKey = getTodayKey();
    const todayStatus = store.dailyByDate[todayKey] || {
      date: todayKey,
      completedTaskIds: [],
      allDoneBonusApplied: false,
      penaltyApplied: false,
    };

    const isCompleting = !todayStatus.completedTaskIds.includes(taskId);
    const newCompletedIds = isCompleting
      ? [...todayStatus.completedTaskIds, taskId]
      : todayStatus.completedTaskIds.filter((id) => id !== taskId);

    // Calculate coin change
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const coinChange = isCompleting ? task.coins : -task.coins;
    const newWalletCoins = store.walletCoins + coinChange;

    // Check if all tasks completed
    const allDone = newCompletedIds.length === store.tasks.length;
    const wasAllDone = todayStatus.completedTaskIds.length === store.tasks.length;

    let bonusChange = 0;
    let newAllDoneBonusApplied = todayStatus.allDoneBonusApplied;

    if (allDone && !todayStatus.allDoneBonusApplied) {
      bonusChange = store.settings.bonuses.allDoneDailyBonus;
      newAllDoneBonusApplied = true;
    } else if (!allDone && wasAllDone && todayStatus.allDoneBonusApplied) {
      bonusChange = -store.settings.bonuses.allDoneDailyBonus;
      newAllDoneBonusApplied = false;
    }

    const finalWalletCoins = newWalletCoins + bonusChange;

    // Update local state immediately
    setStore((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        walletCoins: finalWalletCoins,
        dailyByDate: {
          ...prev.dailyByDate,
          [todayKey]: {
            ...todayStatus,
            completedTaskIds: newCompletedIds,
            allDoneBonusApplied: newAllDoneBonusApplied,
          },
        },
      };
    });

    // Update database
    try {
      // Upsert daily progress
      await supabase.from("child_daily_progress").upsert({
        child_id: selectedChild.id,
        date: todayKey,
        completed_task_ids: newCompletedIds,
        all_done_bonus_applied: newAllDoneBonusApplied,
        penalty_applied: todayStatus.penaltyApplied,
      }, { onConflict: "child_id,date" });

      // Update wallet coins
      await supabase.from("children").update({
        wallet_coins: finalWalletCoins,
      }).eq("id", selectedChild.id);

      // Update weekly coins
      const weekKey = getWeekKey(new Date());
      const currentWeeklyCoins = store.weeklyCoinsByWeekKey[weekKey] || 0;
      const newWeeklyCoins = currentWeeklyCoins + coinChange + bonusChange;

      await supabase.from("child_weekly_coins").upsert({
        child_id: selectedChild.id,
        week_key: weekKey,
        coins: newWeeklyCoins,
      }, { onConflict: "child_id,week_key" });

    } catch (error) {
      console.error("Error updating task:", error);
      // Reload data on error
      loadData();
    }
  }, [selectedChild, store, loadData]);

  // Buy reward
  const buyReward = useCallback(async (rewardId: string) => {
    if (!selectedChild || !store) return false;

    const reward = store.rewards.find((r) => r.id === rewardId);
    if (!reward || store.walletCoins < reward.cost) return false;

    const newWalletCoins = store.walletCoins - reward.cost;

    // Update local state
    setStore((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        walletCoins: newWalletCoins,
      };
    });

    // Update database
    try {
      await supabase.from("children").update({
        wallet_coins: newWalletCoins,
      }).eq("id", selectedChild.id);

      return true;
    } catch (error) {
      console.error("Error buying reward:", error);
      loadData();
      return false;
    }
  }, [selectedChild, store, loadData]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    if (!selectedChild || !store) return;

    const mergedSettings = {
      ...store.settings,
      ...newSettings,
      bonuses: {
        ...store.settings.bonuses,
        ...newSettings.bonuses,
      },
      penalties: {
        ...store.settings.penalties,
        ...newSettings.penalties,
      },
    };

    // Update local state
    setStore((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: mergedSettings,
      };
    });

    // Update database
    try {
      await supabase.from("child_settings").update({
        pin: mergedSettings.pin,
        bonus_all_done: mergedSettings.bonuses.allDoneDailyBonus,
        bonus_three_day_streak: mergedSettings.bonuses.threeDayStreakBonus,
        bonus_perfect_week: mergedSettings.bonuses.perfectWeekBonus,
        penalty_zero_tasks: mergedSettings.penalties.zeroTasks,
        penalty_one_to_four: mergedSettings.penalties.oneToFour,
      }).eq("child_id", selectedChild.id);
    } catch (error) {
      console.error("Error updating settings:", error);
      loadData();
    }
  }, [selectedChild, store, loadData]);

  // Add task
  const addTask = useCallback(async (task: Omit<Task, "id">) => {
    if (!selectedChild) return;

    try {
      const { data, error } = await supabase.from("child_tasks").insert({
        child_id: selectedChild.id,
        title: task.title,
        coins: task.coins,
        icon: task.icon,
        sort_order: (store?.tasks.length || 0) + 1,
      }).select().single();

      if (!error && data) {
        setStore((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: [...prev.tasks, { id: data.id, title: data.title, coins: data.coins, icon: data.icon }],
          };
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }, [selectedChild, store]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!selectedChild) return;

    try {
      await supabase.from("child_tasks").update({
        title: updates.title,
        coins: updates.coins,
        icon: updates.icon,
      }).eq("id", taskId);

      setStore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        };
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, [selectedChild]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    if (!selectedChild) return;

    try {
      await supabase.from("child_tasks").delete().eq("id", taskId);

      setStore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
        };
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }, [selectedChild]);

  // Add reward
  const addReward = useCallback(async (reward: Omit<Reward, "id">) => {
    if (!selectedChild) return;

    try {
      const { data, error } = await supabase.from("child_rewards").insert({
        child_id: selectedChild.id,
        title: reward.title,
        cost: reward.cost,
        icon: reward.icon,
        requires_perfect_week: reward.requiresPerfectWeek || false,
        sort_order: (store?.rewards.length || 0) + 1,
      }).select().single();

      if (!error && data) {
        setStore((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rewards: [...prev.rewards, {
              id: data.id,
              title: data.title,
              cost: data.cost,
              icon: data.icon,
              requiresPerfectWeek: data.requires_perfect_week,
            }],
          };
        });
      }
    } catch (error) {
      console.error("Error adding reward:", error);
    }
  }, [selectedChild, store]);

  // Update reward
  const updateReward = useCallback(async (rewardId: string, updates: Partial<Reward>) => {
    if (!selectedChild) return;

    try {
      await supabase.from("child_rewards").update({
        title: updates.title,
        cost: updates.cost,
        icon: updates.icon,
        requires_perfect_week: updates.requiresPerfectWeek,
      }).eq("id", rewardId);

      setStore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          rewards: prev.rewards.map((r) =>
            r.id === rewardId ? { ...r, ...updates } : r
          ),
        };
      });
    } catch (error) {
      console.error("Error updating reward:", error);
    }
  }, [selectedChild]);

  // Delete reward
  const deleteReward = useCallback(async (rewardId: string) => {
    if (!selectedChild) return;

    try {
      await supabase.from("child_rewards").delete().eq("id", rewardId);

      setStore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          rewards: prev.rewards.filter((r) => r.id !== rewardId),
        };
      });
    } catch (error) {
      console.error("Error deleting reward:", error);
    }
  }, [selectedChild]);

  // Get today's status
  const getTodayStatus = useCallback(() => {
    if (!store) return null;
    const todayKey = getTodayKey();
    return store.dailyByDate[todayKey] || {
      date: todayKey,
      completedTaskIds: [],
      allDoneBonusApplied: false,
      penaltyApplied: false,
    };
  }, [store]);

  // Get weekly coins
  const getWeeklyCoins = useCallback(() => {
    if (!store) return 0;
    const weekKey = getWeekKey(new Date());
    return store.weeklyCoinsByWeekKey[weekKey] || 0;
  }, [store]);

  return {
    store,
    isLoading,
    isShopDay,
    toggleTask,
    buyReward,
    updateSettings,
    addTask,
    updateTask,
    deleteTask,
    addReward,
    updateReward,
    deleteReward,
    getTodayStatus,
    getWeeklyCoins,
    refresh: loadData,
  };
}
