import { motion } from "framer-motion";
import { Reward } from "@/lib/morning-coins/types";
import { CoinIcon } from "@/design/icons";

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
      className={`shop-item ${isDisabled ? "opacity-60" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Icon */}
        <div className="icon-bubble yellow">
          <span className="text-2xl">{reward.icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="shop-title">{reward.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-black ${canAfford ? "text-secondary" : "text-muted-foreground"}`}>
              {reward.cost}
            </span>
            <CoinIcon size={18} />
            {reward.requiresPerfectWeek && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">
                שבוע מושלם
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buy button */}
      <motion.button
        onClick={onBuy}
        disabled={isDisabled}
        className={`btn-kid ${isDisabled ? "btn-ghost-kid" : "btn-secondary-kid"}`}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
      >
        קנה
      </motion.button>

      {needsPerfectWeek && (
        <div className="w-full mt-2 text-sm text-muted-foreground text-center">
          צריך לסיים את כל 5 ימי הלימודים כדי לפתוח
        </div>
      )}
    </motion.div>
  );
}
