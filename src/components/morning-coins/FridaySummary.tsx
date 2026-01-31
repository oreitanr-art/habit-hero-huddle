import { useState } from "react";
import { motion } from "framer-motion";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { CoinDisplay } from "@/components/morning-coins/CoinDisplay";
import { RewardCard } from "@/components/morning-coins/RewardCard";
import { PinDialog } from "@/components/morning-coins/PinDialog";
import { CelebrationOverlay } from "@/components/morning-coins/CelebrationOverlay";
import { useToast } from "@/hooks/use-toast";

export function FridaySummary() {
  const { 
    store, 
    getWeeklyCoins,
    buyReward 
  } = useMorningCoinsCloud();
  const { toast } = useToast();
  
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [purchasedReward, setPurchasedReward] = useState<string | null>(null);

  if (!store) return null;

  const weeklyCoins = getWeeklyCoins();
  
  // Calculate completed days this week (simplified - count days with all tasks done)
  const completedDaysThisWeek = Object.values(store.dailyByDate).filter(
    d => d.allDoneBonusApplied
  ).length;
  
  const hasPerfectWeek = completedDaysThisWeek >= 5;

  const handleBuyClick = (rewardId: string) => {
    setSelectedRewardId(rewardId);
    setShowPinDialog(true);
  };

  const handlePinSuccess = async () => {
    if (!selectedRewardId) return;
    
    const reward = store.rewards.find(r => r.id === selectedRewardId);
    if (!reward) return;

    // Check if can afford
    if (store.walletCoins < reward.cost) {
      toast({
        title: "אין מספיק מטבעות",
        description: `צריך ${reward.cost} מטבעות, יש לך רק ${store.walletCoins}`,
        variant: "destructive",
      });
      setShowPinDialog(false);
      setSelectedRewardId(null);
      return;
    }

    // Check perfect week requirement
    if (reward.requiresPerfectWeek && !hasPerfectWeek) {
      toast({
        title: "צריך שבוע מושלם",
        description: "הפרס הזה זמין רק למי שסיים 5 ימים מושלמים",
        variant: "destructive",
      });
      setShowPinDialog(false);
      setSelectedRewardId(null);
      return;
    }
    
    const success = await buyReward(selectedRewardId);
    
    setShowPinDialog(false);
    setSelectedRewardId(null);
    
    if (success) {
      setPurchasedReward(reward.title);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setPurchasedReward(null);
      }, 3000);
    }
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
          שישי שמח! 🎊
        </h1>
        <p className="text-muted-foreground">
          בוא נראה מה הרווחת השבוע
        </p>
      </motion.div>

      {/* Weekly summary */}
      <motion.div 
        className="bg-card rounded-3xl p-6 shadow-soft"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold mb-4 text-center">סיכום השבוע</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <CoinDisplay amount={weeklyCoins} label="מטבעות השבוע" size="lg" animate />
          <div className="bg-secondary rounded-2xl p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">ימים מושלמים</div>
            <div className="text-4xl font-bold">
              {completedDaysThisWeek}/5
            </div>
            <div className="text-2xl">
              {completedDaysThisWeek >= 5 ? "🏆" : completedDaysThisWeek >= 3 ? "⭐" : "📅"}
            </div>
          </div>
        </div>

        {hasPerfectWeek && (
          <motion.div 
            className="bg-success/10 rounded-2xl p-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-3xl">🎉</span>
            <h3 className="font-bold text-success mt-2">שבוע מושלם!</h3>
            <p className="text-sm text-muted-foreground">כל הפרסים המיוחדים פתוחים!</p>
          </motion.div>
        )}

        {store.streak.current > 0 && (
          <div className="mt-4 text-center">
            <span className="text-2xl">🔥</span>
            <span className="font-bold mx-2 text-xl">{store.streak.current}</span>
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
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🏪</span>
          <span>חנות הפרסים</span>
        </h2>

        <div className="space-y-3">
          {store.rewards.map((reward, index) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              weeklyCoins={store.walletCoins}
              hasPerfectWeek={hasPerfectWeek}
              onBuy={() => handleBuyClick(reward.id)}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* PIN Dialog */}
      <PinDialog
        isOpen={showPinDialog}
        onClose={() => {
          setShowPinDialog(false);
          setSelectedRewardId(null);
        }}
        onSuccess={handlePinSuccess}
        correctPin={store.settings.pin}
        title="קוד הורה לאישור קנייה"
      />

      {/* Celebration */}
      <CelebrationOverlay 
        isVisible={showCelebration}
        message={purchasedReward ? `קנית: ${purchasedReward}` : "נהדר!"}
      />
    </div>
  );
}
