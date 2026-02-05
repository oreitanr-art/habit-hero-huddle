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
  ShoppingBag,
  Calendar,
  TrendingUp,
  Check,
  X,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [activeTab, setActiveTab] = useState<string>("info");
  const [editingChild, setEditingChild] = useState<{
    id: string;
    wallet_coins: number;
    streak_current: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    setActiveTab("info");
  };

  const toggleChildExpand = (childId: string) => {
    setExpandedChildId(expandedChildId === childId ? null : childId);
    setActiveTab("info");
  };

  // Filter users based on search query
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesParent =
      u.parent_name.toLowerCase().includes(query) ||
      u.parent_email.toLowerCase().includes(query);
    const matchesChild = u.children.some((c) =>
      c.child_name.toLowerCase().includes(query)
    );
    return matchesParent || matchesChild;
  });

  const totalChildren = users.reduce((sum, u) => sum + u.children.length, 0);
  const totalPurchases = users.reduce(
    (sum, u) =>
      sum + u.children.reduce((cSum, c) => cSum + c.purchases.length, 0),
    0
  );

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
      <div className="grid grid-cols-3 gap-2">
        <div className="card-kid text-center py-3">
          <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-black">{users.length}</div>
          <div className="text-xs text-muted-foreground">משתמשים</div>
        </div>
        <div className="card-kid text-center py-3">
          <Baby className="h-6 w-6 mx-auto mb-1 text-secondary" />
          <div className="text-2xl font-black">{totalChildren}</div>
          <div className="text-xs text-muted-foreground">ילדים</div>
        </div>
        <div className="card-kid text-center py-3">
          <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-accent" />
          <div className="text-2xl font-black">{totalPurchases}</div>
          <div className="text-xs text-muted-foreground">רכישות</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="חיפוש לפי שם הורה, אימייל או שם ילד..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Users list */}
      <div className="space-y-3">
        <h2 className="h2-kid flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>
            משתמשים ({filteredUsers.length}
            {searchQuery && ` מתוך ${users.length}`})
          </span>
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
            {filteredUsers.map((userProfile) => (
              <UserCard
                key={userProfile.id}
                userProfile={userProfile}
                isCurrentUser={userProfile.user_id === user?.id}
                isExpanded={expandedUserId === userProfile.id}
                expandedChildId={expandedChildId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
  editingChild: {
    id: string;
    wallet_coins: number;
    streak_current: number;
  } | null;
  onToggleExpand: () => void;
  onToggleChildExpand: (childId: string) => void;
  onGrantAdmin: () => void;
  onRevokeAdmin: () => void;
  onDeleteUser: () => void;
  onEditChild: (child: {
    id: string;
    wallet_coins: number;
    streak_current: number;
  }) => void;
  onSaveChild: () => void;
  onCancelEditChild: () => void;
  onDeleteChild: (childId: string, childName: string) => void;
}

function UserCard({
  userProfile,
  isCurrentUser,
  isExpanded,
  expandedChildId,
  activeTab,
  setActiveTab,
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
  const totalCoins = userProfile.children.reduce(
    (sum, c) => sum + c.wallet_coins,
    0
  );

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
        <div className="flex items-center gap-3">
          <div className="text-left text-sm">
            <div className="text-muted-foreground">
              {userProfile.children.length} ילדים
            </div>
            <div className="coin-badge text-xs">
              {totalCoins} <CoinIcon size={12} />
            </div>
          </div>
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
                    {new Date(userProfile.created_at).toLocaleDateString(
                      "he-IL"
                    )}
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
                    ילדים ({userProfile.children.length})
                  </h3>
                  {userProfile.children.map((child) => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      isExpanded={expandedChildId === child.id}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isEditing: boolean;
  editingData: {
    id: string;
    wallet_coins: number;
    streak_current: number;
  } | null;
  onToggleExpand: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdateEditing: (
    updates: Partial<{ wallet_coins: number; streak_current: number }>
  ) => void;
}

function ChildCard({
  child,
  isExpanded,
  activeTab,
  setActiveTab,
  isEditing,
  editingData,
  onToggleExpand,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdateEditing,
}: ChildCardProps) {
  const tabs = [
    { id: "info", label: "מידע", icon: Baby },
    { id: "tasks", label: "מטלות", icon: ListTodo, count: child.tasks.length },
    { id: "rewards", label: "פרסים", icon: Gift, count: child.rewards.length },
    {
      id: "purchases",
      label: "רכישות",
      icon: ShoppingBag,
      count: child.purchases.length,
    },
    {
      id: "progress",
      label: "התקדמות",
      icon: Calendar,
      count: child.dailyProgress.length,
    },
  ];

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
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="opacity-70">({tab.count})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="min-h-[100px]">
                {activeTab === "info" && (
                  <InfoTab
                    child={child}
                    isEditing={isEditing}
                    editingData={editingData}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onUpdateEditing={onUpdateEditing}
                  />
                )}
                {activeTab === "tasks" && <TasksTab tasks={child.tasks} />}
                {activeTab === "rewards" && (
                  <RewardsTab rewards={child.rewards} />
                )}
                {activeTab === "purchases" && (
                  <PurchasesTab purchases={child.purchases} />
                )}
                {activeTab === "progress" && (
                  <ProgressTab
                    dailyProgress={child.dailyProgress}
                    weeklyCoins={child.weeklyCoins}
                    tasks={child.tasks}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tab Components
function InfoTab({
  child,
  isEditing,
  editingData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdateEditing,
}: {
  child: UserWithDetails["children"][0];
  isEditing: boolean;
  editingData: {
    id: string;
    wallet_coins: number;
    streak_current: number;
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdateEditing: (
    updates: Partial<{ wallet_coins: number; streak_current: number }>
  ) => void;
}) {
  return (
    <div className="space-y-3">
      {isEditing && editingData ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm min-w-16">מטבעות:</label>
            <Input
              type="number"
              value={editingData.wallet_coins}
              onChange={(e) =>
                onUpdateEditing({ wallet_coins: Number(e.target.value) })
              }
              className="w-24 text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm min-w-16">רצף:</label>
            <Input
              type="number"
              value={editingData.streak_current}
              onChange={(e) =>
                onUpdateEditing({ streak_current: Number(e.target.value) })
              }
              className="w-24 text-center"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="btn-kid btn-secondary-kid text-sm flex items-center gap-1 flex-1"
            >
              <Save className="h-4 w-4" />
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
        <>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">מטבעות:</span>{" "}
              <span className="font-bold">{child.wallet_coins}</span>
            </div>
            <div>
              <span className="text-muted-foreground">רצף:</span>{" "}
              <span className="font-bold">{child.streak_current} ימים</span>
            </div>
            <div>
              <span className="text-muted-foreground">תאריך לידה:</span>{" "}
              <span className="font-bold">
                {child.birth_date
                  ? new Date(child.birth_date).toLocaleDateString("he-IL")
                  : "לא צוין"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">נוצר:</span>{" "}
              <span className="font-bold">
                {new Date(child.created_at).toLocaleDateString("he-IL")}
              </span>
            </div>
          </div>

          {/* Settings summary */}
          {child.settings && (
            <div className="text-sm bg-background/50 rounded-lg p-2">
              <div className="flex items-center gap-1 font-bold mb-1">
                <Settings className="h-3 w-3" />
                הגדרות
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>PIN: {child.settings.pin}</span>
                <span>בונוס יומי: +{child.settings.bonus_all_done}</span>
                <span>
                  בונוס רצף: +{child.settings.bonus_three_day_streak}
                </span>
                <span>
                  בונוס שבועי: +{child.settings.bonus_perfect_week}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
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
        </>
      )}
    </div>
  );
}

function TasksTab({
  tasks,
}: {
  tasks: UserWithDetails["children"][0]["tasks"];
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">אין מטלות</div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span>{task.icon}</span>
            <span className="text-sm font-medium">{task.title}</span>
          </div>
          <span className="coin-badge text-xs">
            {task.coins} <CoinIcon size={12} />
          </span>
        </div>
      ))}
    </div>
  );
}

function RewardsTab({
  rewards,
}: {
  rewards: UserWithDetails["children"][0]["rewards"];
}) {
  if (rewards.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">אין פרסים</div>
    );
  }

  return (
    <div className="space-y-1">
      {rewards.map((reward) => (
        <div
          key={reward.id}
          className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span>{reward.icon}</span>
            <span className="text-sm font-medium">{reward.title}</span>
            {reward.requires_perfect_week && (
              <span className="text-xs bg-warning/20 text-warning-foreground px-1.5 rounded">
                ⭐
              </span>
            )}
          </div>
          <span className="coin-badge text-xs">
            {reward.cost} <CoinIcon size={12} />
          </span>
        </div>
      ))}
    </div>
  );
}

function PurchasesTab({
  purchases,
}: {
  purchases: UserWithDetails["children"][0]["purchases"];
}) {
  if (purchases.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
        אין רכישות עדיין
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[200px] overflow-y-auto">
      {purchases.map((purchase) => (
        <div
          key={purchase.id}
          className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span>{purchase.reward_icon}</span>
            <div>
              <span className="text-sm font-medium">
                {purchase.reward_title}
              </span>
              <div className="text-xs text-muted-foreground">
                {new Date(purchase.purchased_at).toLocaleDateString("he-IL", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
          <span className="coin-badge text-xs">
            -{purchase.cost} <CoinIcon size={12} />
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgressTab({
  dailyProgress,
  weeklyCoins,
  tasks,
}: {
  dailyProgress: UserWithDetails["children"][0]["dailyProgress"];
  weeklyCoins: UserWithDetails["children"][0]["weeklyCoins"];
  tasks: UserWithDetails["children"][0]["tasks"];
}) {
  const recentProgress = dailyProgress.slice(0, 7); // Last 7 days

  return (
    <div className="space-y-3">
      {/* Weekly coins summary */}
      {weeklyCoins.length > 0 && (
        <div className="bg-background/50 rounded-lg p-2">
          <div className="flex items-center gap-1 font-bold text-sm mb-2">
            <TrendingUp className="h-3 w-3" />
            מטבעות שבועיים
          </div>
          <div className="space-y-1">
            {weeklyCoins.slice(0, 4).map((week) => (
              <div
                key={week.id}
                className="flex justify-between text-xs"
              >
                <span className="text-muted-foreground">{week.week_key}</span>
                <span className="coin-badge">
                  {week.coins} <CoinIcon size={10} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily progress */}
      <div className="bg-background/50 rounded-lg p-2">
        <div className="flex items-center gap-1 font-bold text-sm mb-2">
          <Calendar className="h-3 w-3" />
          התקדמות יומית (7 ימים אחרונים)
        </div>
        {recentProgress.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-2">
            אין נתונים
          </div>
        ) : (
          <div className="space-y-1">
            {recentProgress.map((day) => (
              <div
                key={day.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("he-IL", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span>
                    {day.completed_task_ids.length}/{tasks.length} מטלות
                  </span>
                  {day.all_done_bonus_applied && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
