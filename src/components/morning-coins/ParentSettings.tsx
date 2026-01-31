import { useState } from "react";
import { motion } from "framer-motion";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Reward } from "@/lib/morning-coins/types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          הגדרות - {selectedChild.child_name} ⚙️
        </h1>
      </motion.div>

      {/* Wallet status */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="font-bold mb-2">סטטוס נוכחי</h2>
        <div className="flex items-center gap-4 text-lg">
          <span>בארנק: <strong>{store.walletCoins}</strong> 🪙</span>
          <span>רצף: <strong>{store.streak.current}</strong> ימים</span>
        </div>
      </motion.div>

      {/* PIN Settings */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-bold mb-3">קוד הורה</h2>
        <p className="text-sm text-muted-foreground mb-3">
          קוד נוכחי: {store.settings.pin}
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            maxLength={4}
            placeholder="קוד חדש (4 ספרות)"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))}
            className="flex-1 border rounded-xl p-3 bg-background"
          />
          <button
            onClick={handleUpdatePin}
            disabled={newPin.length !== 4}
            className="px-4 py-2 rounded-xl coin-gradient text-primary-foreground font-bold disabled:opacity-50"
          >
            שמור
          </button>
        </div>
      </motion.div>

      {/* Tasks Management */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">מטלות</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            <Plus className="h-4 w-4" />
            הוסף
          </button>
        </div>
        <div className="space-y-2">
          {store.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 p-2 bg-secondary rounded-xl">
              <span className="text-2xl">{task.icon}</span>
              <span className="flex-1">{task.title}</span>
              <span className="font-bold">{task.coins} 🪙</span>
              <button
                onClick={() => setEditingTask(task)}
                className="px-3 py-1 rounded-lg bg-muted text-sm"
              >
                ערוך
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rewards Management */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">פרסים</h2>
          <button
            onClick={() => setShowAddReward(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            <Plus className="h-4 w-4" />
            הוסף
          </button>
        </div>
        <div className="space-y-2">
          {store.rewards.map(reward => (
            <div key={reward.id} className="flex items-center gap-2 p-2 bg-secondary rounded-xl">
              <span className="text-2xl">{reward.icon}</span>
              <span className="flex-1">{reward.title}</span>
              <span className="font-bold">{reward.cost} 🪙</span>
              {reward.requiresPerfectWeek && <span className="text-xs">⭐</span>}
              <button
                onClick={() => setEditingReward(reward)}
                className="px-3 py-1 rounded-lg bg-muted text-sm"
              >
                ערוך
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bonuses */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-bold mb-3">בונוסים</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>סיום יומי מלא</span>
            <input
              type="number"
              value={store.settings.bonuses.allDoneDailyBonus}
              onChange={e => handleUpdateBonuses("allDoneDailyBonus", Number(e.target.value))}
              className="w-20 border rounded-lg p-2 text-center bg-background"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>3 ימים ברצף</span>
            <input
              type="number"
              value={store.settings.bonuses.threeDayStreakBonus}
              onChange={e => handleUpdateBonuses("threeDayStreakBonus", Number(e.target.value))}
              className="w-20 border rounded-lg p-2 text-center bg-background"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>שבוע מושלם</span>
            <input
              type="number"
              value={store.settings.bonuses.perfectWeekBonus}
              onChange={e => handleUpdateBonuses("perfectWeekBonus", Number(e.target.value))}
              className="w-20 border rounded-lg p-2 text-center bg-background"
            />
          </div>
        </div>
      </motion.div>

      {/* Penalties */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-bold mb-3">קנסות (ערכים שליליים)</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>0 מטלות ביום</span>
            <input
              type="number"
              value={store.settings.penalties.zeroTasks}
              onChange={e => handleUpdatePenalties("zeroTasks", Number(e.target.value))}
              className="w-20 border rounded-lg p-2 text-center bg-background"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>1-4 מטלות</span>
            <input
              type="number"
              value={store.settings.penalties.oneToFour}
              onChange={e => handleUpdatePenalties("oneToFour", Number(e.target.value))}
              className="w-20 border rounded-lg p-2 text-center bg-background"
            />
          </div>
        </div>
      </motion.div>

      {/* Add Task Dialog */}
      {showAddTask && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lift">
            <h2 className="text-xl font-bold mb-4">הוסף מטלה</h2>
            <div className="space-y-3">
              <input
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="שם המטלה"
              />
              <input
                value={newTask.icon}
                onChange={e => setNewTask({ ...newTask, icon: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={newTask.coins}
                onChange={e => setNewTask({ ...newTask, coins: Number(e.target.value) })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="מטבעות"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-3 rounded-xl bg-muted"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 py-3 rounded-xl coin-gradient text-primary-foreground font-bold"
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
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lift">
            <h2 className="text-xl font-bold mb-4">הוסף פרס</h2>
            <div className="space-y-3">
              <input
                value={newReward.title}
                onChange={e => setNewReward({ ...newReward, title: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="שם הפרס"
              />
              <input
                value={newReward.icon}
                onChange={e => setNewReward({ ...newReward, icon: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={newReward.cost}
                onChange={e => setNewReward({ ...newReward, cost: Number(e.target.value) })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="מחיר"
              />
              <label className="flex items-center gap-2">
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
                  className="flex-1 py-3 rounded-xl bg-muted"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddReward}
                  className="flex-1 py-3 rounded-xl coin-gradient text-primary-foreground font-bold"
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
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lift">
            <h2 className="text-xl font-bold mb-4">עריכת מטלה</h2>
            <div className="space-y-3">
              <input
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="שם המטלה"
              />
              <input
                value={editingTask.icon}
                onChange={e => setEditingTask({ ...editingTask, icon: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={editingTask.coins}
                onChange={e => setEditingTask({ ...editingTask, coins: Number(e.target.value) })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="מטבעות"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="p-3 rounded-xl bg-destructive text-destructive-foreground"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-3 rounded-xl bg-muted"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleSaveTask(editingTask)}
                  className="flex-1 py-3 rounded-xl coin-gradient text-primary-foreground font-bold"
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
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lift">
            <h2 className="text-xl font-bold mb-4">עריכת פרס</h2>
            <div className="space-y-3">
              <input
                value={editingReward.title}
                onChange={e => setEditingReward({ ...editingReward, title: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="שם הפרס"
              />
              <input
                value={editingReward.icon}
                onChange={e => setEditingReward({ ...editingReward, icon: e.target.value })}
                className="w-full border rounded-xl p-3 bg-background text-center text-3xl"
                placeholder="אייקון"
              />
              <input
                type="number"
                value={editingReward.cost}
                onChange={e => setEditingReward({ ...editingReward, cost: Number(e.target.value) })}
                className="w-full border rounded-xl p-3 bg-background"
                placeholder="מחיר"
              />
              <label className="flex items-center gap-2">
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
                  className="p-3 rounded-xl bg-destructive text-destructive-foreground"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setEditingReward(null)}
                  className="flex-1 py-3 rounded-xl bg-muted"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleSaveReward(editingReward)}
                  className="flex-1 py-3 rounded-xl coin-gradient text-primary-foreground font-bold"
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
