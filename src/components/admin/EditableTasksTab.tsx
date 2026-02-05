import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Plus, Save, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CoinIcon } from "@/design/icons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  child_id: string;
  title: string;
  coins: number;
  icon: string;
}

interface EditableTasksTabProps {
  tasks: Task[];
  childId: string;
  onRefresh: () => Promise<void>;
}

const TASK_ICONS = ["⏰", "👕", "🪥", "🥣", "🛏️", "🎒", "📚", "🧹", "🍽️", "🧺", "🚿", "💤", "☀️", "🌙"];

export function EditableTasksTab({ tasks, childId, onRefresh }: EditableTasksTabProps) {
  const { toast } = useToast();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ title: string; coins: number; icon: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", coins: 2, icon: "✅" });
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingData({ title: task.title, coins: task.coins, icon: task.icon });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingData(null);
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editingData) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("child_tasks")
        .update({
          title: editingData.title,
          coins: editingData.coins,
          icon: editingData.icon,
        })
        .eq("id", taskId);

      if (error) throw error;

      toast({ title: "המטלה עודכנה בהצלחה" });
      setEditingTaskId(null);
      setEditingData(null);
      await onRefresh();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "שגיאה בעדכון המטלה", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`האם למחוק את המטלה "${taskTitle}"?`)) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("child_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast({ title: "המטלה נמחקה" });
      await onRefresh();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "שגיאה במחיקת המטלה", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({ title: "נא להזין שם למטלה", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("child_tasks")
        .insert({
          child_id: childId,
          title: newTask.title,
          coins: newTask.coins,
          icon: newTask.icon,
          sort_order: tasks.length,
        });

      if (error) throw error;

      toast({ title: "המטלה נוספה בהצלחה" });
      setNewTask({ title: "", coins: 2, icon: "✅" });
      setIsAdding(false);
      await onRefresh();
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "שגיאה בהוספת המטלה", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {tasks.length === 0 && !isAdding ? (
        <div className="text-center text-muted-foreground py-4">אין מטלות</div>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-background/50 rounded-lg px-3 py-2"
            >
              {editingTaskId === task.id && editingData ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {TASK_ICONS.map((icon) => (
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
                      placeholder="שם המטלה"
                    />
                    <Input
                      type="number"
                      value={editingData.coins}
                      onChange={(e) => setEditingData({ ...editingData, coins: Number(e.target.value) })}
                      className="w-16 text-center text-sm h-8"
                      min={1}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
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
                    <span>{task.icon}</span>
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="coin-badge text-xs">
                      {task.coins} <CoinIcon size={12} />
                    </span>
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
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

      {/* Add new task */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 rounded-lg p-3 space-y-2"
          >
            <div className="flex gap-1 flex-wrap">
              {TASK_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewTask({ ...newTask, icon })}
                  className={`text-lg p-1 rounded ${newTask.icon === icon ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="flex-1 text-sm h-8"
                placeholder="שם המטלה החדשה"
              />
              <Input
                type="number"
                value={newTask.coins}
                onChange={(e) => setNewTask({ ...newTask, coins: Number(e.target.value) })}
                className="w-16 text-center text-sm h-8"
                min={1}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
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
            הוסף מטלה
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
