import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Plus, Save, Check, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CoinIcon } from "@/design/icons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Reward {
  id: string;
  child_id: string;
  title: string;
  cost: number;
  icon: string;
  requires_perfect_week: boolean;
}

interface EditableRewardsTabProps {
  rewards: Reward[];
  childId: string;
  onRefresh: () => Promise<void>;
}

const REWARD_ICONS = ["📱", "🍪", "🎮", "🌳", "🧸", "🎬", "🍕", "🎳", "🏊", "🎢", "🍦", "🛍️", "🎁", "⭐"];

export function EditableRewardsTab({ rewards, childId, onRefresh }: EditableRewardsTabProps) {
  const { toast } = useToast();
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ title: string; cost: number; icon: string; requires_perfect_week: boolean } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newReward, setNewReward] = useState({ title: "", cost: 20, icon: "🎁", requires_perfect_week: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (reward: Reward) => {
    setEditingRewardId(reward.id);
    setEditingData({ 
      title: reward.title, 
      cost: reward.cost, 
      icon: reward.icon,
      requires_perfect_week: reward.requires_perfect_week
    });
  };

  const handleCancelEdit = () => {
    setEditingRewardId(null);
    setEditingData(null);
  };

  const handleSaveEdit = async (rewardId: string) => {
    if (!editingData) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("child_rewards")
        .update({
          title: editingData.title,
          cost: editingData.cost,
          icon: editingData.icon,
          requires_perfect_week: editingData.requires_perfect_week,
        })
        .eq("id", rewardId);

      if (error) throw error;

      toast({ title: "הפרס עודכן בהצלחה" });
      setEditingRewardId(null);
      setEditingData(null);
      await onRefresh();
    } catch (error) {
      console.error("Error updating reward:", error);
      toast({ title: "שגיאה בעדכון הפרס", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReward = async (rewardId: string, rewardTitle: string) => {
    if (!confirm(`האם למחוק את הפרס "${rewardTitle}"?`)) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("child_rewards")
        .delete()
        .eq("id", rewardId);

      if (error) throw error;

      toast({ title: "הפרס נמחק" });
      await onRefresh();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast({ title: "שגיאה במחיקת הפרס", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReward = async () => {
    if (!newReward.title.trim()) {
      toast({ title: "נא להזין שם לפרס", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("child_rewards")
        .insert({
          child_id: childId,
          title: newReward.title,
          cost: newReward.cost,
          icon: newReward.icon,
          requires_perfect_week: newReward.requires_perfect_week,
          sort_order: rewards.length,
        });

      if (error) throw error;

      toast({ title: "הפרס נוסף בהצלחה" });
      setNewReward({ title: "", cost: 20, icon: "🎁", requires_perfect_week: false });
      setIsAdding(false);
      await onRefresh();
    } catch (error) {
      console.error("Error adding reward:", error);
      toast({ title: "שגיאה בהוספת הפרס", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {rewards.length === 0 && !isAdding ? (
        <div className="text-center text-muted-foreground py-4">אין פרסים</div>
      ) : (
        <div className="space-y-1">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-background/50 rounded-lg px-3 py-2"
            >
              {editingRewardId === reward.id && editingData ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {REWARD_ICONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setEditingData({ ...editingData, icon })}
                          className={`text-lg p-1 rounded ${editingData.icon === icon ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent"}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingData.title}
                      onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                      className="flex-1 text-sm h-8"
                      placeholder="שם הפרס"
                    />
                    <Input
                      type="number"
                      value={editingData.cost}
                      onChange={(e) => setEditingData({ ...editingData, cost: Number(e.target.value) })}
                      className="w-16 text-center text-sm h-8"
                      min={1}
                    />
                  </div>
                  <button
                    onClick={() => setEditingData({ ...editingData, requires_perfect_week: !editingData.requires_perfect_week })}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${editingData.requires_perfect_week ? "bg-warning/20 text-warning-foreground" : "bg-muted"}`}
                  >
                    <Star className="h-3 w-3" />
                    דורש שבוע מושלם
                    {editingData.requires_perfect_week && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(reward.id)}
                      disabled={isLoading}
                      className="btn-kid btn-secondary-kid text-xs flex items-center gap-1 flex-1"
                    >
                      <Save className="h-3 w-3" />
                      שמור
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="btn-kid btn-ghost-kid text-xs flex-1"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{reward.icon}</span>
                    <span className="text-sm font-medium">{reward.title}</span>
                    {reward.requires_perfect_week && (
                      <span className="text-xs bg-warning/20 text-warning-foreground px-1.5 rounded">
                        ⭐
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="coin-badge text-xs">
                      {reward.cost} <CoinIcon size={12} />
                    </span>
                    <button
                      onClick={() => handleStartEdit(reward)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id, reward.title)}
                      className="p-1 hover:bg-destructive/20 rounded text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new reward */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 rounded-lg p-3 space-y-2"
          >
            <div className="flex gap-1 flex-wrap">
              {REWARD_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewReward({ ...newReward, icon })}
                  className={`text-lg p-1 rounded ${newReward.icon === icon ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newReward.title}
                onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                className="flex-1 text-sm h-8"
                placeholder="שם הפרס החדש"
              />
              <Input
                type="number"
                value={newReward.cost}
                onChange={(e) => setNewReward({ ...newReward, cost: Number(e.target.value) })}
                className="w-16 text-center text-sm h-8"
                min={1}
              />
            </div>
            <button
              onClick={() => setNewReward({ ...newReward, requires_perfect_week: !newReward.requires_perfect_week })}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${newReward.requires_perfect_week ? "bg-warning/20 text-warning-foreground" : "bg-muted"}`}
            >
              <Star className="h-3 w-3" />
              דורש שבוע מושלם
              {newReward.requires_perfect_week && <Check className="h-3 w-3" />}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleAddReward}
                disabled={isLoading}
                className="btn-kid btn-secondary-kid text-xs flex items-center gap-1 flex-1"
              >
                <Check className="h-3 w-3" />
                הוסף
              </button>
              <button
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
                className="btn-kid btn-ghost-kid text-xs flex-1"
              >
                ביטול
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full btn-kid btn-ghost-kid text-xs flex items-center justify-center gap-1"
          >
            <Plus className="h-3 w-3" />
            הוסף פרס
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
