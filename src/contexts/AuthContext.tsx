import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
}

interface Child {
  id: string;
  child_name: string;
  wallet_coins: number;
  streak_current: number;
  streak_last_all_done_date: string | null;
  birth_date: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  children: Child[];
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
  isLoading: boolean;
  isRecoveryMode: boolean;
  clearRecoveryMode: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const clearRecoveryMode = () => setIsRecoveryMode(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
    return data;
  };

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (!error && data) {
      setChildrenList(data as Child[]);
      // Auto-select first child if none selected
      if (data.length > 0 && !selectedChild) {
        setSelectedChild(data[0] as Child);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshChildren = async () => {
    await fetchChildren();
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Check for PASSWORD_RECOVERY event
        if (event === "PASSWORD_RECOVERY") {
          setIsRecoveryMode(true);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid blocking auth state change
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            await fetchChildren();
          }, 0);
        } else {
          setProfile(null);
          setChildrenList([]);
          setSelectedChild(null);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(() => fetchChildren());
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setChildrenList([]);
    setSelectedChild(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        children: childrenList,
        selectedChild,
        setSelectedChild,
        isLoading,
        isRecoveryMode,
        clearRecoveryMode,
        signOut,
        refreshProfile,
        refreshChildren,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
