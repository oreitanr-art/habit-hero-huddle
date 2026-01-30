import { useState } from "react";
import { motion } from "framer-motion";
import { useMorningCoins } from "@/hooks/useMorningCoins";
import { Task, Reward } from "@/lib/morning-coins/types";

export function ParentSettings() {
  const { store, updateStore, resetStore } = useMorningCoins();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [newPin, setNewPin] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!store) return null;

  const handleUpdatePin = () => {
    if (newPin.length === 4) {
      updateStore(s => ({
        ...s,
        settings: { ...s.settings, pin: newPin }
      }));
      setNewPin("");
      alert("הקוד עודכן בהצלחה!");
    }
  };

  const handleUpdateTask = (task: Task) => {
    updateStore(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === task.id ? task : t)
    }));
    setEditingTask(null);
  };

  const handleUpdateReward = (reward: Reward) => {
    updateStore(s => ({
      ...s,
      rewards: s.rewards.map(r => r.id === reward.id ? reward : r)
    }));
    setEditingReward(null);
  };

  const handleUpdateBonuses = (key: string, value: number) => {
    updateStore(s => ({
      ...s,
      settings: {
        ...s.settings,
        bonuses: { ...s.settings.bonuses, [key]: value }
      }
    }));
  };

  const handleUpdatePenalties = (key: string, value: number) => {
    updateStore(s => ({
      ...s,
      settings: {
        ...s.settings,
        penalties: { ...s.settings.penalties, [key]: value }
      }
    }));
  };

  const handleReset = () => {
    resetStore();
    setShowResetConfirm(false);
    alert("כל הנתונים אופסו!");
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
          הגדרות הורה ⚙️
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
        <h2 className="font-bold mb-3">מטלות</h2>
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
        <h2 className="font-bold mb-3">פרסים</h2>
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

      {/* Reset */}
      <motion.div 
        className="bg-destructive/10 rounded-2xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="font-bold mb-3 text-destructive">איפוס נתונים</h2>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold"
          >
            איפוס מלא
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center">בטוח? כל הנתונים יימחקו!</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-muted"
              >
                ביטול
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold"
              >
                כן, איפוס!
              </button>
            </div>
          </div>
        )}
      </motion.div>

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
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-3 rounded-xl bg-muted"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleUpdateTask(editingTask)}
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
                  onClick={() => setEditingReward(null)}
                  className="flex-1 py-3 rounded-xl bg-muted"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleUpdateReward(editingReward)}
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
