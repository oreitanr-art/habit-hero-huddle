import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useMorningCoins } from "@/hooks/useMorningCoins";
import { CoinDisplay } from "@/components/morning-coins/CoinDisplay";
import { TaskCard } from "@/components/morning-coins/TaskCard";
import { ProgressBar } from "@/components/morning-coins/ProgressBar";
import { CelebrationOverlay } from "@/components/morning-coins/CelebrationOverlay";

export function ChildChecklist() {
  const { 
    store, 
    completedTaskIds, 
    todayEarned, 
    weeklyCoins, 
    allTasksCompleted,
    toggleTask 
  } = useMorningCoins();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevAllCompleted, setPrevAllCompleted] = useState(false);

  // Check for celebration trigger
  const handleToggle = useCallback((taskId: string) => {
    const wasAllCompleted = allTasksCompleted;
    toggleTask(taskId);
    
    // Will be all completed after this toggle?
    if (!wasAllCompleted && store) {
      const willBeCompleted = completedTaskIds.size === store.tasks.length - 1 && 
        !completedTaskIds.has(taskId);
      
      if (willBeCompleted) {
        setTimeout(() => {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2500);
        }, 300);
      }
    }
  }, [toggleTask, allTasksCompleted, completedTaskIds, store]);

  if (!store) return null;

  const completedCount = completedTaskIds.size;
  const totalTasks = store.tasks.length;
  const maxDailyCoins = store.tasks.reduce((sum, t) => sum + t.coins, 0);

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          בוקר טוב! ☀️
        </h1>
        <p className="text-muted-foreground">
          בוא נסיים את המטלות ונרוויח מטבעות!
        </p>
      </motion.div>

      {/* Coins display */}
      <div className="grid grid-cols-2 gap-3">
        <CoinDisplay amount={store.walletCoins} label="בארנק" animate />
        <CoinDisplay amount={weeklyCoins} label="השבוע" animate />
      </div>

      {/* Today's progress */}
      <motion.div 
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ProgressBar 
          current={completedCount} 
          total={totalTasks} 
          label="מטלות הבוקר" 
        />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">הרווחת היום:</span>
          <span className="font-bold flex items-center gap-1">
            {todayEarned} / {maxDailyCoins} 🪙
          </span>
        </div>
        {allTasksCompleted && (
          <motion.div 
            className="mt-3 text-center text-success font-bold flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span>🎉</span>
            <span>סיימת הכל! קיבלת בונוס +{store.settings.bonuses.allDoneDailyBonus}</span>
            <span>🎉</span>
          </motion.div>
        )}
      </motion.div>

      {/* Task list */}
      <div className="space-y-3">
        {store.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleted={completedTaskIds.has(task.id)}
            onToggle={() => handleToggle(task.id)}
            index={index}
          />
        ))}
      </div>

      {/* Streak info */}
      {store.streak.current > 0 && (
        <motion.div 
          className="bg-primary/10 rounded-2xl p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-2xl">🔥</span>
          <span className="font-bold mx-2">{store.streak.current}</span>
          <span className="text-muted-foreground">ימים ברצף!</span>
        </motion.div>
      )}

      {/* Celebration overlay */}
      <CelebrationOverlay 
        isVisible={showCelebration} 
        message="סיימת את כל המטלות!"
        coins={store.settings.bonuses.allDoneDailyBonus}
      />
    </div>
  );
}
