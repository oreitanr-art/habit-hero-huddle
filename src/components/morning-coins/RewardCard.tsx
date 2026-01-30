import { motion } from "framer-motion";
import { Reward } from "@/lib/morning-coins/types";

interface RewardCardProps {
  reward: Reward;
  weeklyCoins: number;
  hasPerfectWeek: boolean;
  onBuy: () => void;
  index: number;
}

export function RewardCard({ reward, weeklyCoins, hasPerfectWeek, onBuy, index }: RewardCardProps) {
  const canAfford = weeklyCoins >= reward.cost;
  const needsPerfectWeek = reward.requiresPerfectWeek && !hasPerfectWeek;
  const isDisabled = !canAfford || needsPerfectWeek;

  return (
    <motion.div
      className={`
        p-4 rounded-2xl border-2 transition-all
        ${isDisabled 
          ? "bg-muted/50 border-border opacity-60" 
          : "bg-card border-primary/30 shadow-soft hover:shadow-lift"
        }
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl">
          {reward.icon}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="font-semibold text-lg">{reward.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-bold ${canAfford ? "text-primary" : "text-muted-foreground"}`}>
              {reward.cost}
            </span>
            <span>🪙</span>
            {reward.requiresPerfectWeek && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                שבוע מושלם
              </span>
            )}
          </div>
        </div>

        {/* Buy button */}
        <motion.button
          onClick={onBuy}
          disabled={isDisabled}
          className={`
            px-5 py-3 rounded-xl font-bold text-lg transition-all
            ${isDisabled 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "coin-gradient text-primary-foreground coin-shadow hover:scale-105 active:scale-95"
            }
          `}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
        >
          קנה
        </motion.button>
      </div>

      {needsPerfectWeek && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          צריך לסיים את כל 5 ימי הלימודים כדי לפתוח
        </div>
      )}
    </motion.div>
  );
}
