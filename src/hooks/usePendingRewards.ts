import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface PendingReward {
  id: string;
  childId: string;
  childName: string;
  rewardTitle: string;
  rewardIcon: string;
  cost: number;
  purchasedAt: string;
  weekKey: string;
}

export function usePendingRewards() {
  const { profile, children } = useAuth();
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create a map of child IDs to names
  const childNameMap = new Map(children.map(c => [c.id, c.child_name]));

  const loadPendingRewards = useCallback(async () => {
    if (!profile || children.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const childIds = children.map(c => c.id);
      
      const { data, error } = await supabase
        .from("reward_purchases")
        .select("*")
        .in("child_id", childIds)
        .is("fulfilled_at", null)
        .order("purchased_at", { ascending: false });

      if (error) throw error;

      const rewards: PendingReward[] = (data || []).map(r => ({
        id: r.id,
        childId: r.child_id,
        childName: childNameMap.get(r.child_id) || "ילד",
        rewardTitle: r.reward_title,
        rewardIcon: r.reward_icon,
        cost: r.cost,
        purchasedAt: r.purchased_at,
        weekKey: r.week_key,
      }));

      setPendingRewards(rewards);
    } catch (error) {
      console.error("Error loading pending rewards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile, children, childNameMap]);

  useEffect(() => {
    loadPendingRewards();
  }, [loadPendingRewards]);

  const fulfillReward = useCallback(async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from("reward_purchases")
        .update({ fulfilled_at: new Date().toISOString() })
        .eq("id", rewardId);

      if (error) throw error;

      // Remove from local state
      setPendingRewards(prev => prev.filter(r => r.id !== rewardId));
      return true;
    } catch (error) {
      console.error("Error fulfilling reward:", error);
      return false;
    }
  }, []);

  return {
    pendingRewards,
    isLoading,
    fulfillReward,
    refresh: loadPendingRewards,
    hasPendingRewards: pendingRewards.length > 0,
  };
}
