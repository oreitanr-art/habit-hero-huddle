import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  created_at: string;
}

interface Child {
  id: string;
  parent_id: string;
  child_name: string;
  wallet_coins: number;
  streak_current: number;
  created_at: string;
}

interface ChildTask {
  id: string;
  child_id: string;
  title: string;
  coins: number;
  icon: string;
}

interface ChildReward {
  id: string;
  child_id: string;
  title: string;
  cost: number;
  icon: string;
  requires_perfect_week: boolean;
}

interface ChildSettings {
  id: string;
  child_id: string;
  pin: string;
  bonus_all_done: number;
  bonus_three_day_streak: number;
  bonus_perfect_week: number;
  penalty_zero_tasks: number;
  penalty_one_to_four: number;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
}

export interface UserWithDetails extends Profile {
  children: (Child & {
    tasks: ChildTask[];
    rewards: ChildReward[];
    settings: ChildSettings | null;
  })[];
  role: "admin" | "user" | null;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (error) throw error;
        setIsAdmin(data === true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch all users with their data (only for admins)
  const fetchAllUsers = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoadingUsers(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all children
      const { data: children, error: childrenError } = await supabase
        .from("children")
        .select("*");

      if (childrenError) throw childrenError;

      // Fetch all tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("child_tasks")
        .select("*");

      if (tasksError) throw tasksError;

      // Fetch all rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from("child_rewards")
        .select("*");

      if (rewardsError) throw rewardsError;

      // Fetch all settings
      const { data: settings, error: settingsError } = await supabase
        .from("child_settings")
        .select("*");

      if (settingsError) throw settingsError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Build user details
      const usersWithDetails: UserWithDetails[] = (profiles || []).map((profile) => {
        const userChildren = (children || [])
          .filter((c) => c.parent_id === profile.id)
          .map((child) => ({
            ...child,
            tasks: (tasks || []).filter((t) => t.child_id === child.id),
            rewards: (rewards || []).filter((r) => r.child_id === child.id),
            settings: (settings || []).find((s) => s.child_id === child.id) || null,
          }));

        const userRole = (roles || []).find((r) => r.user_id === profile.user_id);

        return {
          ...profile,
          children: userChildren,
          role: userRole?.role || null,
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAdmin]);

  // Grant admin role to a user
  const grantAdminRole = useCallback(
    async (targetUserId: string) => {
      if (!isAdmin || !user) return false;

      try {
        const { error } = await supabase.from("user_roles").upsert(
          {
            user_id: targetUserId,
            role: "admin" as const,
            granted_by: user.id,
          },
          { onConflict: "user_id,role" }
        );

        if (error) throw error;
        await fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Error granting admin role:", error);
        return false;
      }
    },
    [isAdmin, user, fetchAllUsers]
  );

  // Revoke admin role from a user
  const revokeAdminRole = useCallback(
    async (targetUserId: string) => {
      if (!isAdmin || !user || targetUserId === user.id) return false;

      try {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId)
          .eq("role", "admin");

        if (error) throw error;
        await fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Error revoking admin role:", error);
        return false;
      }
    },
    [isAdmin, user, fetchAllUsers]
  );

  // Delete a user (profile and all related data)
  const deleteUser = useCallback(
    async (profileId: string) => {
      if (!isAdmin) return false;

      try {
        // Delete profile (cascade will handle children and related data)
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", profileId);

        if (error) throw error;
        await fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        return false;
      }
    },
    [isAdmin, fetchAllUsers]
  );

  // Update child data
  const updateChild = useCallback(
    async (childId: string, updates: Partial<Child>) => {
      if (!isAdmin) return false;

      try {
        const { error } = await supabase
          .from("children")
          .update(updates)
          .eq("id", childId);

        if (error) throw error;
        await fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Error updating child:", error);
        return false;
      }
    },
    [isAdmin, fetchAllUsers]
  );

  // Delete child
  const deleteChild = useCallback(
    async (childId: string) => {
      if (!isAdmin) return false;

      try {
        const { error } = await supabase
          .from("children")
          .delete()
          .eq("id", childId);

        if (error) throw error;
        await fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Error deleting child:", error);
        return false;
      }
    },
    [isAdmin, fetchAllUsers]
  );

  return {
    isAdmin,
    isLoading,
    users,
    isLoadingUsers,
    fetchAllUsers,
    grantAdminRole,
    revokeAdminRole,
    deleteUser,
    updateChild,
    deleteChild,
  };
}
