import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, UserWithDetails } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CoinIcon } from "@/design/icons";
import {
  Users,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldOff,
  Trash2,
  Edit2,
  Baby,
  ListTodo,
  Gift,
  Settings,
} from "lucide-react";

export function AdminDashboard() {
  const {
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
  } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [editingChild, setEditingChild] = useState<{
    id: string;
    wallet_coins: number;
    streak_current: number;
  } | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin, fetchAllUsers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <CoinIcon size={48} />
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="card-kid text-center py-12">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="h2-kid mb-2">אין גישה</h2>
        <p className="p-kid">רק מנהלי מערכת יכולים לגשת לעמוד זה</p>
      </div>
    );
  }

  const handleGrantAdmin = async (targetUserId: string) => {
    const success = await grantAdminRole(targetUserId);
    if (success) {
      toast({ title: "הרשאת אדמין ניתנה בהצלחה" });
    } else {
      toast({ title: "שגיאה במתן הרשאות", variant: "destructive" });
    }
  };

  const handleRevokeAdmin = async (targetUserId: string) => {
    const success = await revokeAdminRole(targetUserId);
    if (success) {
      toast({ title: "הרשאת אדמין בוטלה" });
    } else {
      toast({ title: "שגיאה בביטול הרשאות", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (profileId: string, userName: string) => {
    if (!confirm(`האם למחוק את המשתמש "${userName}" וכל הנתונים שלו?`)) return;
    
    const success = await deleteUser(profileId);
    if (success) {
      toast({ title: "המשתמש נמחק בהצלחה" });
    } else {
      toast({ title: "שגיאה במחיקת המשתמש", variant: "destructive" });
    }
  };

  const handleSaveChild = async () => {
    if (!editingChild) return;

    const success = await updateChild(editingChild.id, {
      wallet_coins: editingChild.wallet_coins,
      streak_current: editingChild.streak_current,
    });

    if (success) {
      toast({ title: "הילד עודכן בהצלחה" });
      setEditingChild(null);
    } else {
      toast({ title: "שגיאה בעדכון הילד", variant: "destructive" });
    }
  };

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!confirm(`האם למחוק את "${childName}" וכל הנתונים שלו?`)) return;

    const success = await deleteChild(childId);
    if (success) {
      toast({ title: "הילד נמחק בהצלחה" });
    } else {
      toast({ title: "שגיאה במחיקת הילד", variant: "destructive" });
    }
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
    setExpandedChildId(null);
  };

  const toggleChildExpand = (childId: string) => {
    setExpandedChildId(expandedChildId === childId ? null : childId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="h1-kid mb-2">לוח בקרה 🛡️</h1>
        <p className="p-kid">ניהול משתמשים ונתונים</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-kid text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-3xl font-black">{users.length}</div>
          <div className="text-sm text-muted-foreground">משתמשים</div>
        </div>
        <div className="card-kid text-center">
          <Baby className="h-8 w-8 mx-auto mb-2 text-secondary" />
          <div className="text-3xl font-black">
            {users.reduce((sum, u) => sum + u.children.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">ילדים</div>
        </div>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        <h2 className="h2-kid flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>משתמשים ({users.length})</span>
        </h2>

        {isLoadingUsers ? (
          <div className="card-kid text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block"
            >
              <CoinIcon size={32} />
            </motion.div>
            <p className="mt-2 text-muted-foreground">טוען משתמשים...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((userProfile) => (
              <UserCard
                key={userProfile.id}
                userProfile={userProfile}
                isCurrentUser={userProfile.user_id === user?.id}
                isExpanded={expandedUserId === userProfile.id}
                expandedChildId={expandedChildId}
                editingChild={editingChild}
                onToggleExpand={() => toggleUserExpand(userProfile.id)}
                onToggleChildExpand={toggleChildExpand}
                onGrantAdmin={() => handleGrantAdmin(userProfile.user_id)}
                onRevokeAdmin={() => handleRevokeAdmin(userProfile.user_id)}
                onDeleteUser={() =>
                  handleDeleteUser(userProfile.id, userProfile.parent_name)
                }
                onEditChild={setEditingChild}
                onSaveChild={handleSaveChild}
                onCancelEditChild={() => setEditingChild(null)}
                onDeleteChild={handleDeleteChild}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface UserCardProps {
  userProfile: UserWithDetails;
  isCurrentUser: boolean;
  isExpanded: boolean;
  expandedChildId: string | null;
  editingChild: { id: string; wallet_coins: number; streak_current: number } | null;
  onToggleExpand: () => void;
  onToggleChildExpand: (childId: string) => void;
  onGrantAdmin: () => void;
  onRevokeAdmin: () => void;
  onDeleteUser: () => void;
  onEditChild: (child: { id: string; wallet_coins: number; streak_current: number }) => void;
  onSaveChild: () => void;
  onCancelEditChild: () => void;
  onDeleteChild: (childId: string, childName: string) => void;
}

function UserCard({
  userProfile,
  isCurrentUser,
  isExpanded,
  expandedChildId,
  editingChild,
  onToggleExpand,
  onToggleChildExpand,
  onGrantAdmin,
  onRevokeAdmin,
  onDeleteUser,
  onEditChild,
  onSaveChild,
  onCancelEditChild,
  onDeleteChild,
}: UserCardProps) {
  return (
    <motion.div
      className="card-kid overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* User header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="icon-bubble yellow">
            <span className="text-xl">👤</span>
          </div>
          <div className="text-right">
            <div className="font-black flex items-center gap-2">
              {userProfile.parent_name}
              {userProfile.role === "admin" && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  אדמין
                </span>
              )}
              {isCurrentUser && (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                  אתה
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {userProfile.parent_email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {userProfile.children.length} ילדים
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-border mt-4 space-y-4">
              {/* User info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">טלפון:</span>{" "}
                  <span className="font-bold">
                    {userProfile.parent_phone || "לא צוין"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">נרשם:</span>{" "}
                  <span className="font-bold">
                    {new Date(userProfile.created_at).toLocaleDateString("he-IL")}
                  </span>
                </div>
              </div>

              {/* Admin actions */}
              <div className="flex flex-wrap gap-2">
                {userProfile.role === "admin" ? (
                  !isCurrentUser && (
                    <button
                      onClick={onRevokeAdmin}
                      className="btn-kid btn-ghost-kid text-sm flex items-center gap-1"
                    >
                      <ShieldOff className="h-4 w-4" />
                      בטל אדמין
                    </button>
                  )
                ) : (
                  <button
                    onClick={onGrantAdmin}
                    className="btn-kid btn-primary-kid text-sm flex items-center gap-1"
                  >
                    <Shield className="h-4 w-4" />
                    הפוך לאדמין
                  </button>
                )}
                {!isCurrentUser && (
                  <button
                    onClick={onDeleteUser}
                    className="btn-kid text-sm flex items-center gap-1 bg-destructive text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    מחק משתמש
                  </button>
                )}
              </div>

              {/* Children */}
              {userProfile.children.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-black text-sm flex items-center gap-1">
                    <Baby className="h-4 w-4" />
                    ילדים
                  </h3>
                  {userProfile.children.map((child) => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      isExpanded={expandedChildId === child.id}
                      isEditing={editingChild?.id === child.id}
                      editingData={editingChild}
                      onToggleExpand={() => onToggleChildExpand(child.id)}
                      onEdit={() =>
                        onEditChild({
                          id: child.id,
                          wallet_coins: child.wallet_coins,
                          streak_current: child.streak_current,
                        })
                      }
                      onSave={onSaveChild}
                      onCancel={onCancelEditChild}
                      onDelete={() => onDeleteChild(child.id, child.child_name)}
                      onUpdateEditing={(updates) =>
                        editingChild &&
                        onEditChild({ ...editingChild, ...updates })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ChildCardProps {
  child: UserWithDetails["children"][0];
  isExpanded: boolean;
  isEditing: boolean;
  editingData: { id: string; wallet_coins: number; streak_current: number } | null;
  onToggleExpand: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdateEditing: (updates: Partial<{ wallet_coins: number; streak_current: number }>) => void;
}

function ChildCard({
  child,
  isExpanded,
  isEditing,
  editingData,
  onToggleExpand,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdateEditing,
}: ChildCardProps) {
  return (
    <div className="bg-muted/50 rounded-xl p-3">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">👶</span>
          <span className="font-bold">{child.child_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="coin-badge text-sm">
            {child.wallet_coins} <CoinIcon size={14} />
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border space-y-3">
              {/* Child stats */}
              {isEditing && editingData ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">מטבעות:</label>
                    <input
                      type="number"
                      value={editingData.wallet_coins}
                      onChange={(e) =>
                        onUpdateEditing({ wallet_coins: Number(e.target.value) })
                      }
                      className="input-kid w-24 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">רצף:</label>
                    <input
                      type="number"
                      value={editingData.streak_current}
                      onChange={(e) =>
                        onUpdateEditing({ streak_current: Number(e.target.value) })
                      }
                      className="input-kid w-24 text-center"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onSave}
                      className="btn-kid btn-secondary-kid text-sm flex-1"
                    >
                      שמור
                    </button>
                    <button
                      onClick={onCancel}
                      className="btn-kid btn-ghost-kid text-sm flex-1"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">מטבעות:</span>{" "}
                    <span className="font-bold">{child.wallet_coins}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">רצף:</span>{" "}
                    <span className="font-bold">{child.streak_current} ימים</span>
                  </div>
                </div>
              )}

              {/* Tasks summary */}
              <div className="text-sm">
                <div className="flex items-center gap-1 font-bold mb-1">
                  <ListTodo className="h-4 w-4" />
                  מטלות ({child.tasks.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {child.tasks.map((task) => (
                    <span
                      key={task.id}
                      className="text-xs bg-background px-2 py-1 rounded-full"
                    >
                      {task.icon} {task.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rewards summary */}
              <div className="text-sm">
                <div className="flex items-center gap-1 font-bold mb-1">
                  <Gift className="h-4 w-4" />
                  פרסים ({child.rewards.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {child.rewards.map((reward) => (
                    <span
                      key={reward.id}
                      className="text-xs bg-background px-2 py-1 rounded-full"
                    >
                      {reward.icon} {reward.title} ({reward.cost}🪙)
                    </span>
                  ))}
                </div>
              </div>

              {/* Settings summary */}
              {child.settings && (
                <div className="text-sm">
                  <div className="flex items-center gap-1 font-bold mb-1">
                    <Settings className="h-4 w-4" />
                    הגדרות
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>PIN: {child.settings.pin}</span>
                    <span>בונוס יומי: +{child.settings.bonus_all_done}</span>
                    <span>בונוס רצף: +{child.settings.bonus_three_day_streak}</span>
                    <span>בונוס שבועי: +{child.settings.bonus_perfect_week}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="btn-kid btn-ghost-kid text-sm flex items-center gap-1 flex-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    ערוך
                  </button>
                  <button
                    onClick={onDelete}
                    className="btn-kid text-sm flex items-center gap-1 bg-destructive text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
