import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DevNavigation, ViewType } from "@/components/DevNavigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { CoinDisplay } from "@/components/morning-coins/CoinDisplay";
import { ProgressBar } from "@/components/morning-coins/ProgressBar";
import { TaskCard } from "@/components/morning-coins/TaskCard";
import { RewardCard } from "@/components/morning-coins/RewardCard";
import { CoinIcon } from "@/design/icons";

// Mock data for preview
const mockStore = {
  tasks: [
    { id: "1", title: "צחצוח שיניים", icon: "🦷", coins: 2, completed: false },
    { id: "2", title: "התלבשות", icon: "👕", coins: 2, completed: true },
    { id: "3", title: "ארוחת בוקר", icon: "🥣", coins: 2, completed: false },
    { id: "4", title: "סידור חדר", icon: "🛏️", coins: 2, completed: true },
    { id: "5", title: "הכנת תיק", icon: "🎒", coins: 2, completed: false },
  ],
  rewards: [
    { id: "1", title: "גלידה", icon: "🍦", cost: 10, requiresPerfectWeek: false },
    { id: "2", title: "זמן טאבלט", icon: "📱", cost: 15, requiresPerfectWeek: false },
    { id: "3", title: "טיול מיוחד", icon: "🎢", cost: 50, requiresPerfectWeek: true },
  ],
  settings: {
    bonusAllDone: 5,
    bonusThreeDayStreak: 10,
    bonusPerfectWeek: 20,
    penaltyZeroTasks: -10,
    penaltyOneToFour: -5,
    pin: "1234",
  },
  weeklyCoins: 25,
  walletCoins: 45,
  streak: 3,
  completedTaskIds: ["2", "4"],
  todayBonusApplied: false,
  todayPenaltyApplied: false,
};

const DevPreview = () => {
  const [currentView, setCurrentView] = useState<ViewType>("child-checklist");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(mockStore.completedTaskIds);
  const [walletCoins, setWalletCoins] = useState<number>(mockStore.walletCoins);
  const [weeklyCoins, setWeeklyCoins] = useState<number>(mockStore.weeklyCoins);

  const completedSet = useMemo(() => new Set(completedTaskIds), [completedTaskIds]);

  const handleToggleTask = (taskId: string) => {
    const task = mockStore.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isCompleting = !completedSet.has(taskId);
    setCompletedTaskIds((prev) =>
      isCompleting ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
    setWalletCoins((prev) => prev + (isCompleting ? task.coins : -task.coins));
    setWeeklyCoins((prev) => prev + (isCompleting ? task.coins : -task.coins));
  };

  const DevChildChecklistView = () => {
    const completedCount = completedTaskIds.length;
    const totalTasks = mockStore.tasks.length;
    const maxDailyCoins = mockStore.tasks.reduce((sum, t) => sum + t.coins, 0);
    const todayEarned = mockStore.tasks
      .filter((t) => completedSet.has(t.id))
      .reduce((sum, t) => sum + t.coins, 0);

    return (
      <div className="space-y-6">
        <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="h1-kid mb-2">בוקר טוב! ☀️</h1>
          <p className="p-kid">בוא נסיים את המטלות ונרוויח מטבעות!</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <CoinDisplay amount={walletCoins} label="בארנק" animate />
          <CoinDisplay amount={weeklyCoins} label="השבוע" animate />
        </div>

        <motion.div className="card-kid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <ProgressBar current={completedCount} total={totalTasks} label="מטלות הבוקר" />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">הרווחת היום:</span>
            <span className="font-black flex items-center gap-1">
              {todayEarned} / {maxDailyCoins} 🪙
            </span>
          </div>
        </motion.div>

        <div className="task-list-kid">
          {mockStore.tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={{ id: task.id, title: task.title, coins: task.coins, icon: task.icon }}
              isCompleted={completedSet.has(task.id)}
              onToggle={() => handleToggleTask(task.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  };

  const DevShopView = () => {
    const hasPerfectWeek = false;
    return (
      <div className="space-y-6">
        <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="h1-kid mb-2">שישי שמח! 🎊</h1>
          <p className="p-kid">בוא נראה מה הרווחת השבוע</p>
        </motion.div>

        <motion.div className="card-kid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="h2-kid mb-4 text-center">סיכום השבוע</h2>
          <div className="grid grid-cols-2 gap-4">
            <CoinDisplay amount={weeklyCoins} label="מטבעות השבוע" size="lg" animate />
            <CoinDisplay amount={walletCoins} label="בארנק" size="lg" animate />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="h2-kid mb-4 flex items-center gap-2">
            <span>🏪</span>
            <span>חנות הפרסים</span>
          </h2>
          <div className="shop-grid">
            {mockStore.rewards.map((reward, index) => (
              <RewardCard
                key={reward.id}
                reward={{
                  id: reward.id,
                  title: reward.title,
                  cost: reward.cost,
                  icon: reward.icon,
                  requiresPerfectWeek: reward.requiresPerfectWeek,
                }}
                weeklyCoins={walletCoins}
                hasPerfectWeek={hasPerfectWeek}
                onBuy={() => {
                  if (walletCoins < reward.cost) return;
                  setWalletCoins((prev) => prev - reward.cost);
                }}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const DevParentSettingsView = () => (
    <div className="space-y-6">
      <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="h1-kid mb-2">הגדרות הורה ⚙️</h1>
        <p className="p-kid">תצוגה מקדימה (Mock) — ללא שמירה</p>
      </motion.div>

      <div className="card-kid">
        <h2 className="h2-kid mb-3">קוד הורה</h2>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">קוד נוכחי:</span>
          <span className="font-black text-lg">{mockStore.settings.pin}</span>
        </div>
      </div>

      <div className="card-kid">
        <h2 className="h2-kid mb-3">בונוסים</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>סיום יומי מלא</span>
            <span className="font-black">+{mockStore.settings.bonusAllDone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>3 ימים ברצף</span>
            <span className="font-black">+{mockStore.settings.bonusThreeDayStreak}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>שבוע מושלם</span>
            <span className="font-black">+{mockStore.settings.bonusPerfectWeek}</span>
          </div>
        </div>
      </div>

      <div className="card-kid">
        <h2 className="h2-kid mb-3">מטלות</h2>
        <div className="space-y-2">
          {mockStore.tasks.map((t) => (
            <div key={t.id} className="task-row">
              <div className="task-left">
                <div className="icon-bubble yellow">
                  <span className="text-xl">{t.icon}</span>
                </div>
                <span className="task-title">{t.title}</span>
              </div>
              <span className="coin-badge">+{t.coins} 🪙</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-kid">
        <h2 className="h2-kid mb-3">פרסים</h2>
        <div className="space-y-2">
          {mockStore.rewards.map((r) => (
            <div key={r.id} className="task-row">
              <div className="task-left">
                <div className="icon-bubble pink">
                  <span className="text-xl">{r.icon}</span>
                </div>
                <span className="task-title">{r.title}</span>
              </div>
              <span className="coin-badge">{r.cost} 🪙</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAuthView = () => (
    <main className="min-h-screen flex items-center justify-center p-4 kid-container" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <CoinIcon size={80} />
          </motion.div>
          <h1 className="h1-kid">Morning Coins</h1>
          <p className="p-kid">מערכת תגמול משפחתית לבקרים מוצלחים</p>
        </div>

        {currentView === "auth-login" ? (
          <LoginForm onSwitchToRegister={() => setCurrentView("auth-register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setCurrentView("auth-login")} />
        )}
      </motion.div>
    </main>
  );

  const renderChildView = () => (
    <main className="min-h-screen pb-32 kid-container" dir="rtl">
      <motion.header
        className="sticky top-0 z-30 card-kid mb-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoinIcon size={32} />
            <span className="font-black text-xl text-kid-navy">דני 👦</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-kid">
              <CoinIcon size={20} />
              <span>{mockStore.walletCoins}</span>
            </span>
          </div>
        </div>
      </motion.header>

      {currentView === "child-shop" ? (
        <DevShopView />
      ) : (
        <DevChildChecklistView />
      )}
    </main>
  );

  const renderParentView = () => (
    <main className="min-h-screen pb-32 kid-container" dir="rtl">
      <motion.header
        className="sticky top-0 z-30 card-kid mb-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoinIcon size={32} />
            <span className="font-black text-xl text-kid-navy">דני 👦</span>
          </div>
          <motion.button className="btn-kid btn-primary-kid" whileTap={{ scale: 0.95 }}>
            🔓 חזרה לילד
          </motion.button>
        </div>
      </motion.header>

      <DevParentSettingsView />
    </main>
  );

  return (
    <>
      {currentView === "auth-login" || currentView === "auth-register" ? (
        renderAuthView()
      ) : currentView === "parent-settings" ? (
        renderParentView()
      ) : (
        renderChildView()
      )}

      <DevNavigation currentView={currentView} onViewChange={setCurrentView} />
    </>
  );
};

export default DevPreview;
