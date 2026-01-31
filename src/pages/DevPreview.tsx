import { useState } from "react";
import { motion } from "framer-motion";
import { DevNavigation, ViewType } from "@/components/DevNavigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ChildChecklist } from "@/components/morning-coins/ChildChecklist";
import { FridaySummary } from "@/components/morning-coins/FridaySummary";
import { ParentSettings } from "@/components/morning-coins/ParentSettings";
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
    <main className="min-h-screen pb-24 kid-container" dir="rtl">
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
        <FridaySummary />
      ) : (
        <ChildChecklist />
      )}
    </main>
  );

  const renderParentView = () => (
    <main className="min-h-screen pb-24 kid-container" dir="rtl">
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

      <ParentSettings />
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
