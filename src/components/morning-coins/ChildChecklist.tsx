import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { CoinDisplay } from "@/components/morning-coins/CoinDisplay";
import { TaskCard } from "@/components/morning-coins/TaskCard";
import { ProgressBar } from "@/components/morning-coins/ProgressBar";
import { CelebrationOverlay } from "@/components/morning-coins/CelebrationOverlay";
import { GameHub } from "@/games/GameHub";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPeriod, isEveningAvailable } from "@/lib/morning-coins/date-utils";
import { TaskPeriod } from "@/lib/morning-coins/types";
import { Lock, Send, CheckCircle, Gamepad2, Clock } from "lucide-react";

export function ChildChecklist() {
  const {
    store,
    toggleTask,
    getTodayStatus,
    getWeeklyCoins,
    isTodaySubmitted,
    isTodayEveningSubmitted,
    submitToday,
  } = useMorningCoinsCloud();
  const { toast } = useToast();

  const [activePeriod, setActivePeriod] = useState<TaskPeriod>(getCurrentPeriod());
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGameOffer, setShowGameOffer] = useState(false);
  const [showGameLibrary, setShowGameLibrary] = useState(false);

  const todayStatus = getTodayStatus();
  const weeklyCoins = getWeeklyCoins();
  const morningSubmitted = isTodaySubmitted();
  const eveningSubmitted = isTodayEveningSubmitted();
  const eveningAvailable = isEveningAvailable();

  const handleToggle = useCallback((taskId: string) => {
    if (!store) return;
    toggleTask(taskId);
  }, [toggleTask, store]);

  if (!store) return null;

  // Split tasks by period
  const morningTasks = store.tasks.filter((t) => t.taskPeriod === 'morning');
  const eveningTasks = store.tasks.filter((t) => t.taskPeriod === 'evening');

  const currentTasks = activePeriod === 'morning' ? morningTasks : eveningTasks;
  const currentCompleted = activePeriod === 'morning'
    ? new Set(todayStatus?.completedTaskIds || [])
    : new Set(todayStatus?.completedEveningTaskIds || []);
  const isCurrentSubmitted = activePeriod === 'morning' ? morningSubmitted : eveningSubmitted;
  const isCurrentLocked = activePeriod === 'evening' && !eveningAvailable;

  const completedCount = currentCompleted.size;
  const totalTasks = currentTasks.length;
  const allTasksCompleted = completedCount === totalTasks && totalTasks > 0;
  const hasAnyCompleted = completedCount > 0;

  const maxDailyCoins = currentTasks.reduce((sum, t) => sum + t.coins, 0);
  const currentBonusApplied = activePeriod === 'morning'
    ? todayStatus?.allDoneBonusApplied
    : todayStatus?.eveningAllDoneBonusApplied;

  const todayEarned = currentTasks
    .filter((t) => currentCompleted.has(t.id))
    .reduce((sum, t) => sum + t.coins, 0) +
    (currentBonusApplied ? store.settings.bonuses.allDoneDailyBonus : 0);

  const handleToggleWithCelebration = (taskId: string) => {
    if (isCurrentSubmitted || isCurrentLocked) return;

    const periodTasks = activePeriod === 'morning' ? morningTasks : eveningTasks;
    const wasAllCompleted = currentCompleted.size === periodTasks.length;
    const willBeCompleted = currentCompleted.size === periodTasks.length - 1 && !currentCompleted.has(taskId);

    handleToggle(taskId);

    if (willBeCompleted && !wasAllCompleted) {
      setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2500);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isCurrentSubmitted) return;

    setIsSubmitting(true);
    const success = await submitToday(activePeriod);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: "🎉 נשלח בהצלחה!",
        description: activePeriod === 'morning'
          ? "מטלות הבוקר נשמרו!"
          : "מטלות הערב נשמרו! אפשר לשחק!",
      });
      if (activePeriod === 'evening') {
        setShowGameOffer(true);
      }
    } else {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  if (showGameOffer) {
    return <GameHub walletCoins={store.walletCoins} mode="offer" onClose={() => setShowGameOffer(false)} />;
  }
  if (showGameLibrary) {
    return <GameHub walletCoins={store.walletCoins} mode="library" onClose={() => setShowGameLibrary(false)} />;
  }

  const greeting = activePeriod === 'morning' ? "בוקר טוב! ☀️" : "אחה״צ טוב! 🌙";
  const subtitle = isCurrentSubmitted
    ? (activePeriod === 'morning' ? "מטלות הבוקר נשלחו! 👋" : "מטלות הערב נשלחו! אפשר לשחק 👋")
    : isCurrentLocked
      ? "מטלות הערב ייפתחו בשעה 14:00 ⏰"
      : (activePeriod === 'morning'
        ? "בוא נסיים את מטלות הבוקר ונרוויח מטבעות!"
        : "בוא נסיים את מטלות הערב ונרוויח מטבעות!");

  return (
    <div className="space-y-6">
      {/* Period Tabs */}
      <div className="tabs-kid">
        <button
          onClick={() => setActivePeriod('morning')}
          className={`tab-kid flex-1 flex items-center justify-center gap-2 ${activePeriod === 'morning' ? 'tab-kid-active' : ''}`}
        >
          <span>☀️</span>
          <span>בוקר</span>
          {morningSubmitted && <CheckCircle className="h-4 w-4 text-success" />}
        </button>
        <button
          onClick={() => setActivePeriod('evening')}
          className={`tab-kid flex-1 flex items-center justify-center gap-2 ${activePeriod === 'evening' ? 'tab-kid-active' : ''}`}
        >
          <span>🌙</span>
          <span>ערב</span>
          {eveningSubmitted && <CheckCircle className="h-4 w-4 text-success" />}
          {!eveningAvailable && !eveningSubmitted && <Lock className="h-3 w-3 opacity-50" />}
        </button>
      </div>

      {/* Header with greeting */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        key={activePeriod}
      >
        <h1 className="h1-kid mb-2">{greeting}</h1>
        <p className="p-kid">{subtitle}</p>
      </motion.div>

      {/* Evening locked message */}
      {isCurrentLocked && (
        <motion.div
          className="card-kid text-center space-y-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Clock className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-black text-lg">מטלות הערב ייפתחו בשעה 14:00</p>
          <p className="text-muted-foreground text-sm">בינתיים, סיים/י את מטלות הבוקר!</p>
        </motion.div>
      )}

      {/* Submitted banner */}
      {isCurrentSubmitted && (
        <motion.div
          className="card-kid bg-success/10 border-2 border-success text-center space-y-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-success" />
            <span className="font-black text-success text-lg">
              {activePeriod === 'morning' ? 'מטלות הבוקר נשלחו!' : 'מטלות הערב נשלחו!'}
            </span>
            <Lock className="h-5 w-5 text-success" />
          </div>
          {activePeriod === 'evening' && (
            <button
              onClick={() => setShowGameLibrary(true)}
              className="btn-kid btn-primary-kid flex items-center justify-center gap-2 mx-auto"
            >
              <Gamepad2 className="h-5 w-5" />
              <span>שחק משחקים 🎮</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Coins display */}
      {!isCurrentLocked && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <CoinDisplay amount={store.walletCoins} label="בארנק" animate />
            <CoinDisplay amount={weeklyCoins} label="השבוע" animate />
          </div>

          {/* Period progress */}
          <motion.div
            className="card-kid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            key={`progress-${activePeriod}`}
          >
            <ProgressBar
              current={completedCount}
              total={totalTasks}
              label={activePeriod === 'morning' ? "מטלות הבוקר" : "מטלות הערב"}
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">הרווחת:</span>
              <span className="font-black flex items-center gap-1">
                {todayEarned} / {maxDailyCoins + store.settings.bonuses.allDoneDailyBonus} 🪙
              </span>
            </div>
            {allTasksCompleted && !isCurrentSubmitted && (
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
          <div className={`task-list-kid ${isCurrentSubmitted ? "opacity-60 pointer-events-none" : ""}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePeriod}
                initial={{ opacity: 0, x: activePeriod === 'morning' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activePeriod === 'morning' ? 20 : -20 }}
              >
                {currentTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={currentCompleted.has(task.id)}
                    onToggle={() => handleToggleWithCelebration(task.id)}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Submit button */}
          {!isCurrentSubmitted && hasAnyCompleted && (
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
                    <span>
                      {activePeriod === 'morning' ? 'שלח את מטלות הבוקר!' : 'שלח את מטלות הערב!'}
                    </span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </>
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
        message={activePeriod === 'morning' ? "סיימת את מטלות הבוקר!" : "סיימת את מטלות הערב!"}
        coins={store.settings.bonuses.allDoneDailyBonus}
      />
    </div>
  );
}
