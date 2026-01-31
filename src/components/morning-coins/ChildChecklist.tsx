import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { CoinDisplay } from "@/components/morning-coins/CoinDisplay";
import { TaskCard } from "@/components/morning-coins/TaskCard";
import { ProgressBar } from "@/components/morning-coins/ProgressBar";
import { CelebrationOverlay } from "@/components/morning-coins/CelebrationOverlay";
import { GameHub } from "@/games/GameHub";
import { useToast } from "@/hooks/use-toast";
import { Lock, Send, CheckCircle, Gamepad2 } from "lucide-react";

export function ChildChecklist() {
  const { 
    store, 
    toggleTask,
    getTodayStatus,
    getWeeklyCoins,
    isTodaySubmitted,
    submitToday,
  } = useMorningCoinsCloud();
  const { toast } = useToast();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGameOffer, setShowGameOffer] = useState(false);
  const [showGameLibrary, setShowGameLibrary] = useState(false);

  const todayStatus = getTodayStatus();
  const completedTaskIds = new Set(todayStatus?.completedTaskIds || []);
  const weeklyCoins = getWeeklyCoins();
  const isSubmitted = isTodaySubmitted();

  // Check for celebration trigger
  const handleToggle = useCallback((taskId: string) => {
    if (!store || isSubmitted) return;
    
    const wasAllCompleted = completedTaskIds.size === store.tasks.length;
    const willBeCompleted = completedTaskIds.size === store.tasks.length - 1 && 
      !completedTaskIds.has(taskId);
    
    toggleTask(taskId);
    
    if (willBeCompleted && !wasAllCompleted) {
      setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2500);
      }, 300);
    }
  }, [toggleTask, completedTaskIds, store, isSubmitted]);

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    const success = await submitToday();
    setIsSubmitting(false);

    if (success) {
      toast({
        title: "🎉 נשלח בהצלחה!",
        description: "המטלות נשמרו. עכשיו אפשר לשחק!",
      });
      // Show game offer after successful submission
      setShowGameOffer(true);
    } else {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  if (!store) return null;

  const completedCount = completedTaskIds.size;
  const totalTasks = store.tasks.length;
  const maxDailyCoins = store.tasks.reduce((sum, t) => sum + t.coins, 0);
  const allTasksCompleted = completedCount === totalTasks && totalTasks > 0;
  const hasAnyCompleted = completedCount > 0;
  
  // Calculate today's earnings
  const todayEarned = store.tasks
    .filter(t => completedTaskIds.has(t.id))
    .reduce((sum, t) => sum + t.coins, 0) + 
    (todayStatus?.allDoneBonusApplied ? store.settings.bonuses.allDoneDailyBonus : 0);

  // Show game hub if requested
  if (showGameOffer) {
    return (
      <GameHub
        walletCoins={store.walletCoins}
        mode="offer"
        onClose={() => setShowGameOffer(false)}
      />
    );
  }

  if (showGameLibrary) {
    return (
      <GameHub
        walletCoins={store.walletCoins}
        mode="library"
        onClose={() => setShowGameLibrary(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="h1-kid mb-2">
          בוקר טוב! ☀️
        </h1>
        <p className="p-kid">
          {isSubmitted 
            ? "המטלות נשלחו! אפשר לשחק 👋" 
            : "בוא נסיים את המטלות ונרוויח מטבעות!"}
        </p>
      </motion.div>

      {/* Submitted banner with game button */}
      {isSubmitted && (
        <motion.div 
          className="card-kid bg-success/10 border-2 border-success text-center space-y-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-success" />
            <span className="font-black text-success text-lg">המטלות נשלחו!</span>
            <Lock className="h-5 w-5 text-success" />
          </div>
          <button 
            onClick={() => setShowGameLibrary(true)}
            className="btn-kid btn-primary-kid flex items-center justify-center gap-2 mx-auto"
          >
            <Gamepad2 className="h-5 w-5" />
            <span>שחק משחקים 🎮</span>
          </button>
        </motion.div>
      )}

      {/* Coins display */}
      <div className="grid grid-cols-2 gap-3">
        <CoinDisplay amount={store.walletCoins} label="בארנק" animate />
        <CoinDisplay amount={weeklyCoins} label="השבוע" animate />
      </div>

      {/* Today's progress */}
      <motion.div 
        className="card-kid"
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
          <span className="font-black flex items-center gap-1">
            {todayEarned} / {maxDailyCoins + store.settings.bonuses.allDoneDailyBonus} 🪙
          </span>
        </div>
        {allTasksCompleted && !isSubmitted && (
          <motion.div 
            className="mt-3 text-center text-success font-black flex items-center justify-center gap-2"
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
      <div className={`task-list-kid ${isSubmitted ? "opacity-60 pointer-events-none" : ""}`}>
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

      {/* Submit button - show only when not yet submitted and has completed tasks */}
      {!isSubmitted && hasAnyCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4"
        >
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-kid btn-secondary-kid w-full text-lg py-4 flex items-center justify-center gap-2 shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block"
                >
                  🪙
                </motion.div>
                <span>שולח...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>שלח את המטלות!</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Streak info */}
      {store.streak.current > 0 && (
        <motion.div 
          className="pill-kid text-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-2xl">🔥</span>
          <span className="font-black">{store.streak.current}</span>
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
