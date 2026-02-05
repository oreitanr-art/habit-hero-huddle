import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { CoinDisplay } from "@/components/morning-coins/CoinDisplay";
import { RewardCard } from "@/components/morning-coins/RewardCard";
import { ChildSelector } from "@/components/ChildSelector";
import { CoinIcon } from "@/design/icons";
import { ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const ShopPreview = () => {
  const { selectedChild } = useAuth();
  const { store, isLoading, getWeeklyCoins } = useMorningCoinsCloud();
  const [simulatePerfectWeek, setSimulatePerfectWeek] = useState(false);

  if (isLoading || !store || !selectedChild) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <CoinIcon size={48} />
        </motion.div>
      </div>
    );
  }

  const weeklyCoins = getWeeklyCoins();
  
  const completedDaysThisWeek = Object.values(store.dailyByDate).filter(
    d => d.allDoneBonusApplied
  ).length;
  
  const hasPerfectWeek = simulatePerfectWeek || completedDaysThisWeek >= 5;

  return (
    <main className="min-h-screen pb-24 kid-container" dir="rtl">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 card-kid mb-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            <span className="font-black">תצוגת חנות</span>
          </div>

          <div className="flex items-center gap-2">
            <ChildSelector />
            <Link to="/" className="btn-kid btn-ghost-kid p-2">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Simulation banner */}
      <motion.div 
        className="card-kid bg-primary/10 border-primary/30 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">מצב תצוגה מקדימה</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-muted-foreground">סימולציית שבוע מושלם</span>
            <input
              type="checkbox"
              checked={simulatePerfectWeek}
              onChange={(e) => setSimulatePerfectWeek(e.target.checked)}
              className="w-4 h-4 rounded"
            />
          </label>
        </div>
      </motion.div>

      {/* Shop content */}
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="h1-kid mb-2">
            שישי שמח! 🎊
          </h1>
          <p className="p-kid">
            בוא נראה מה הרווחת השבוע
          </p>
        </motion.div>

        {/* Weekly summary */}
        <motion.div 
          className="card-kid"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="h2-kid mb-4 text-center">סיכום השבוע</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <CoinDisplay amount={weeklyCoins} label="מטבעות השבוע" size="lg" animate />
            <div className="card-kid text-center">
              <div className="text-sm text-muted-foreground mb-1">ימים מושלמים</div>
              <div className="text-4xl font-black">
                {simulatePerfectWeek ? 5 : completedDaysThisWeek}/5
              </div>
              <div className="text-2xl">
                {hasPerfectWeek ? "🏆" : completedDaysThisWeek >= 3 ? "⭐" : "📅"}
              </div>
            </div>
          </div>

          {hasPerfectWeek && (
            <motion.div 
              className="icon-bubble green w-full rounded-2xl p-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-3xl">🎉</span>
              <h3 className="font-black text-success mt-2">שבוע מושלם!</h3>
              <p className="text-sm text-muted-foreground">כל הפרסים המיוחדים פתוחים!</p>
            </motion.div>
          )}

          {store.streak.current > 0 && (
            <div className="pill-kid mt-4 justify-center">
              <span className="text-2xl">🔥</span>
              <span className="font-black text-xl">{store.streak.current}</span>
              <span className="text-muted-foreground">ימים ברצף</span>
            </div>
          )}
        </motion.div>

        {/* Rewards shop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="h2-kid mb-4 flex items-center gap-2">
            <span>🏪</span>
            <span>חנות הפרסים</span>
          </h2>

          <div className="shop-grid">
            {store.rewards.map((reward, index) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                weeklyCoins={store.walletCoins}
                hasPerfectWeek={hasPerfectWeek}
                onBuy={() => {
                  // Preview mode - no actual purchase
                }}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Preview note */}
        <motion.div 
          className="card-kid text-center text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>🔒 זוהי תצוגה מקדימה בלבד - לא ניתן לבצע רכישות</p>
        </motion.div>
      </div>
    </main>
  );
};

export default ShopPreview;
