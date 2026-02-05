import { useState } from "react";
import { motion } from "framer-motion";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Reward } from "@/lib/morning-coins/types";
import { useToast } from "@/hooks/use-toast";
import { CoinIcon } from "@/design/icons";
import { Plus, Trash2 } from "lucide-react";
import { PendingRewardsSection } from "./PendingRewardsSection";

export function ParentSettings() {
  const { 
    store, 
    updateSettings, 
    updateTask, 
    deleteTask, 
    addTask,
    updateReward,
    deleteReward,
    addReward,
  } = useMorningCoinsCloud();
  const { selectedChild } = useAuth();
  const { toast } = useToast();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [newPin, setNewPin] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", coins: 2, icon: "✅" });
  const [newReward, setNewReward] = useState({ title: "", cost: 10, icon: "🎁", requiresPerfectWeek: false });

  if (!store || !selectedChild) return null;

  const handleUpdatePin = async () => {
    if (newPin.length === 4) {
      await updateSettings({ pin: newPin });
      setNewPin("");
      toast({ title: "הקוד עודכן בהצלחה!" });
    }
  };

  const handleSaveTask = async (task: Task) => {
    await updateTask(task.id, task);
    setEditingTask(null);
    toast({ title: "המטלה עודכנה!" });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setEditingTask(null);
    toast({ title: "המטלה נמחקה" });
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    await addTask(newTask);
    setNewTask({ title: "", coins: 2, icon: "✅" });
    setShowAddTask(false);
    toast({ title: "המטלה נוספה!" });
  };

  const handleSaveReward = async (reward: Reward) => {
    await updateReward(reward.id, reward);
    setEditingReward(null);
    toast({ title: "הפרס עודכן!" });
  };

  const handleDeleteReward = async (rewardId: string) => {
    await deleteReward(rewardId);
    setEditingReward(null);
    toast({ title: "הפרס נמחק" });
  };

  const handleAddReward = async () => {
    if (!newReward.title.trim()) return;
    await addReward(newReward);
    setNewReward({ title: "", cost: 10, icon: "🎁", requiresPerfectWeek: false });
    setShowAddReward(false);
    toast({ title: "הפרס נוסף!" });
  };

  const handleUpdateBonuses = async (key: string, value: number) => {
    await updateSettings({
      bonuses: { ...store.settings.bonuses, [key]: value }
    });
  };

  const handleUpdatePenalties = async (key: string, value: number) => {
    await updateSettings({
      penalties: { ...store.settings.penalties, [key]: value }
    });
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "לא הוזן";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} שנים`;
  };

  return (
    <div className="space-y-6">
      {/* Pending Rewards Section - shown first when there are pending rewards */}
      <PendingRewardsSection pin={store.settings.pin} />

      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="h1-kid mb-2">
          הגדרות - {selectedChild.child_name} ⚙️
        </h1>
      </motion.div>

      {/* Child info */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="h2-kid mb-2">פרטי הילד/ה</h2>
        <div className="flex items-center gap-4 text-lg flex-wrap">
          <span>👦 שם: <strong>{selectedChild.child_name}</strong></span>
          <span>🎂 גיל: <strong>{calculateAge(selectedChild.birth_date)}</strong></span>
        </div>
      </motion.div>

      {/* Wallet status */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="h2-kid mb-2">סטטוס נוכחי</h2>
        <div className="flex items-center gap-4 text-lg">
          <span className="flex items-center gap-1">בארנק: <strong>{store.walletCoins}</strong> <CoinIcon size={20} /></span>
          <span>רצף: <strong>{store.streak.current}</strong> ימים</span>
        </div>
      </motion.div>

      {/* PIN Settings */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="h2-kid mb-3">קוד הורה</h2>
        <p className="p-kid mb-3">
          קוד נוכחי: {store.settings.pin}
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            maxLength={4}
            placeholder="קוד חדש (4 ספרות)"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))}
            className="input-kid flex-1"
          />
          <button
            onClick={handleUpdatePin}
            disabled={newPin.length !== 4}
            className="btn-kid btn-secondary-kid disabled:opacity-50"
          >
            שמור
          </button>
        </div>
      </motion.div>

      {/* Tasks Management */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="h2-kid">מטלות</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="btn-kid btn-primary-kid flex items-center gap-1 py-2 px-3 text-sm"
          >
            <Plus className="h-4 w-4" />
            הוסף
          </button>
        </div>
        <div className="space-y-2">
          {store.tasks.map(task => (
            <div key={task.id} className="task-row">
              <div className="task-left">
                <div className="icon-bubble yellow">
                  <span className="text-xl">{task.icon}</span>
                </div>
                <span className="task-title">{task.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="coin-badge">{task.coins} <CoinIcon size={16} /></span>
                <button
                  onClick={() => setEditingTask(task)}
                  className="btn-kid btn-ghost-kid py-1 px-3 text-sm"
                >
                  ערוך
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rewards Management */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="h2-kid">פרסים</h2>
          <button
            onClick={() => setShowAddReward(true)}
            className="btn-kid btn-primary-kid flex items-center gap-1 py-2 px-3 text-sm"
          >
            <Plus className="h-4 w-4" />
            הוסף
          </button>
        </div>
        <div className="space-y-2">
          {store.rewards.map(reward => (
            <div key={reward.id} className="task-row">
              <div className="task-left">
                <div className="icon-bubble pink">
                  <span className="text-xl">{reward.icon}</span>
                </div>
                <span className="task-title">{reward.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="coin-badge">{reward.cost} <CoinIcon size={16} /></span>
                {reward.requiresPerfectWeek && <span className="pill-kid py-1 px-2 text-xs">⭐</span>}
                <button
                  onClick={() => setEditingReward(reward)}
                  className="btn-kid btn-ghost-kid py-1 px-3 text-sm"
                >
                  ערוך
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bonuses */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="h2-kid mb-3">בונוסים</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>סיום יומי מלא</span>
            <input
              type="number"
              value={store.settings.bonuses.allDoneDailyBonus}
              onChange={e => handleUpdateBonuses("allDoneDailyBonus", Number(e.target.value))}
              className="input-kid w-20 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>3 ימים ברצף</span>
            <input
              type="number"
              value={store.settings.bonuses.threeDayStreakBonus}
              onChange={e => handleUpdateBonuses("threeDayStreakBonus", Number(e.target.value))}
              className="input-kid w-20 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>שבוע מושלם</span>
            <input
              type="number"
              value={store.settings.bonuses.perfectWeekBonus}
              onChange={e => handleUpdateBonuses("perfectWeekBonus", Number(e.target.value))}
              className="input-kid w-20 text-center"
            />
          </div>
        </div>
      </motion.div>

      {/* Penalties */}
      <motion.div 
        className="card-kid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="h2-kid mb-3">קנסות (ערכים שליליים)</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>0 מטלות ביום</span>
            <input
              type="number"
              value={store.settings.penalties.zeroTasks}
              onChange={e => handleUpdatePenalties("zeroTasks", Number(e.target.value))}
              className="input-kid w-20 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>1-4 מטלות</span>
            <input
              type="number"
              value={store.settings.penalties.oneToFour}
              onChange={e => handleUpdatePenalties("oneToFour", Number(e.target.value))}
              className="input-kid w-20 text-center"
            />
          </div>
        </div>
      </motion.div>

      {/* Add Task Dialog */}
      {showAddTask && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card-kid w-full max-w-sm">
            <h2 className="h2-kid mb-4">הוסף מטלה</h2>
            <div className="space-y-3">
              <input
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="input-kid w-full"
                placeholder="שם המטלה"
              />
              <input
                value={newTask.icon}
                onChange={e => setNewTask({ ...newTask, icon: e.target.value })}
                className="input-kid w-full text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={newTask.coins}
                onChange={e => setNewTask({ ...newTask, coins: Number(e.target.value) })}
                className="input-kid w-full"
                placeholder="מטבעות"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="btn-kid btn-ghost-kid flex-1"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddTask}
                  className="btn-kid btn-secondary-kid flex-1"
                >
                  הוסף
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reward Dialog */}
      {showAddReward && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card-kid w-full max-w-sm">
            <h2 className="h2-kid mb-4">הוסף פרס</h2>
            <div className="space-y-3">
              <input
                value={newReward.title}
                onChange={e => setNewReward({ ...newReward, title: e.target.value })}
                className="input-kid w-full"
                placeholder="שם הפרס"
              />
              <input
                value={newReward.icon}
                onChange={e => setNewReward({ ...newReward, icon: e.target.value })}
                className="input-kid w-full text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={newReward.cost}
                onChange={e => setNewReward({ ...newReward, cost: Number(e.target.value) })}
                className="input-kid w-full"
                placeholder="מחיר"
              />
              <label className="flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={newReward.requiresPerfectWeek}
                  onChange={e => setNewReward({ ...newReward, requiresPerfectWeek: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>דורש שבוע מושלם</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddReward(false)}
                  className="btn-kid btn-ghost-kid flex-1"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddReward}
                  className="btn-kid btn-secondary-kid flex-1"
                >
                  הוסף
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Dialog */}
      {editingTask && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card-kid w-full max-w-sm">
            <h2 className="h2-kid mb-4">עריכת מטלה</h2>
            <div className="space-y-3">
              <input
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                className="input-kid w-full"
                placeholder="שם המטלה"
              />
              <input
                value={editingTask.icon}
                onChange={e => setEditingTask({ ...editingTask, icon: e.target.value })}
                className="input-kid w-full text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={editingTask.coins}
                onChange={e => setEditingTask({ ...editingTask, coins: Number(e.target.value) })}
                className="input-kid w-full"
                placeholder="מטבעות"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="btn-kid p-3 bg-destructive text-white"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="btn-kid btn-ghost-kid flex-1"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleSaveTask(editingTask)}
                  className="btn-kid btn-secondary-kid flex-1"
                >
                  שמור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reward Dialog */}
      {editingReward && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card-kid w-full max-w-sm">
            <h2 className="h2-kid mb-4">עריכת פרס</h2>
            <div className="space-y-3">
              <input
                value={editingReward.title}
                onChange={e => setEditingReward({ ...editingReward, title: e.target.value })}
                className="input-kid w-full"
                placeholder="שם הפרס"
              />
              <input
                value={editingReward.icon}
                onChange={e => setEditingReward({ ...editingReward, icon: e.target.value })}
                className="input-kid w-full text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={editingReward.cost}
                onChange={e => setEditingReward({ ...editingReward, cost: Number(e.target.value) })}
                className="input-kid w-full"
                placeholder="מחיר"
              />
              <label className="flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={editingReward.requiresPerfectWeek || false}
                  onChange={e => setEditingReward({ ...editingReward, requiresPerfectWeek: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>דורש שבוע מושלם</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteReward(editingReward.id)}
                  className="btn-kid p-3 bg-destructive text-white"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setEditingReward(null)}
                  className="btn-kid btn-ghost-kid flex-1"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleSaveReward(editingReward)}
                  className="btn-kid btn-secondary-kid flex-1"
                >
                  שמור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
