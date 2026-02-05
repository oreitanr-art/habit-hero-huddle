import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePendingRewards, PendingReward } from "@/hooks/usePendingRewards";
import { PinDialog } from "@/components/morning-coins/PinDialog";
import { CelebrationOverlay } from "@/components/morning-coins/CelebrationOverlay";
import { useToast } from "@/hooks/use-toast";
import { Gift, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface PendingRewardCardProps {
  reward: PendingReward;
  onFulfill: (id: string) => void;
}

function PendingRewardCard({ reward, onFulfill }: PendingRewardCardProps) {
  const timeAgo = formatDistanceToNow(new Date(reward.purchasedAt), {
    addSuffix: true,
    locale: he,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="card-kid flex items-center justify-between gap-3 p-4"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-3xl flex-shrink-0">{reward.rewardIcon}</div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-lg truncate">{reward.rewardTitle}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="font-medium">{reward.childName}</span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onFulfill(reward.id)}
        className="btn-kid btn-primary-kid flex items-center gap-2 flex-shrink-0"
      >
        <Check className="h-5 w-5" />
        <span>מומש!</span>
      </button>
    </motion.div>
  );
}

interface PendingRewardsSectionProps {
  pin: string;
}

export function PendingRewardsSection({ pin }: PendingRewardsSectionProps) {
  const { pendingRewards, hasPendingRewards, fulfillReward, isLoading } = usePendingRewards();
  const { toast } = useToast();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [fulfilledRewardTitle, setFulfilledRewardTitle] = useState<string | null>(null);

  if (isLoading || !hasPendingRewards) return null;

  const handleFulfillClick = (rewardId: string) => {
    setSelectedRewardId(rewardId);
    setShowPinDialog(true);
  };

  const handlePinSuccess = async () => {
    if (!selectedRewardId) return;

    const reward = pendingRewards.find(r => r.id === selectedRewardId);
    if (!reward) return;

    const success = await fulfillReward(selectedRewardId);
    
    setShowPinDialog(false);
    setSelectedRewardId(null);

    if (success) {
      setFulfilledRewardTitle(reward.rewardTitle);
      setShowCelebration(true);
      toast({
        title: "🎉 ההטבה מומשה!",
        description: `${reward.childName} קיבל/ה: ${reward.rewardTitle}`,
      });
      setTimeout(() => {
        setShowCelebration(false);
        setFulfilledRewardTitle(null);
      }, 2500);
    } else {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full card-kid bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="icon-bubble yellow">
            <Gift className="h-6 w-6" />
          </div>
          <div className="text-right">
            <h3 className="font-black text-lg">הטבות ממתינות למימוש</h3>
            <p className="text-sm text-muted-foreground">
              {pendingRewards.length} הטבות שהילדים רכשו
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground font-bold rounded-full h-7 w-7 flex items-center justify-center">
            {pendingRewards.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Rewards list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {pendingRewards.map((reward) => (
              <PendingRewardCard
                key={reward.id}
                reward={reward}
                onFulfill={handleFulfillClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN Dialog */}
      <PinDialog
        isOpen={showPinDialog}
        onClose={() => {
          setShowPinDialog(false);
          setSelectedRewardId(null);
        }}
        onSuccess={handlePinSuccess}
        correctPin={pin}
        title="קוד הורה לאישור מימוש"
      />

      {/* Celebration */}
      <CelebrationOverlay
        isVisible={showCelebration}
        message={fulfilledRewardTitle ? `${fulfilledRewardTitle} מומש!` : "מומש!"}
      />
    </motion.div>
  );
}
