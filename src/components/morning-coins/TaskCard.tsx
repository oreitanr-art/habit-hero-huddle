import { motion } from "framer-motion";
import { Task } from "@/lib/morning-coins/types";

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  index: number;
}

export function TaskCard({ task, isCompleted, onToggle, index }: TaskCardProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200
        ${isCompleted 
          ? "bg-success/10 border-success completed-glow" 
          : "bg-card border-border hover:border-primary/50 hover:shadow-lift"
        }
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <motion.div 
        className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-3xl
          ${isCompleted ? "bg-success/20" : "bg-secondary"}
        `}
        animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {task.icon}
      </motion.div>

      {/* Title */}
      <div className="flex-1 text-right">
        <div className={`font-semibold text-lg ${isCompleted ? "text-success" : "text-foreground"}`}>
          {task.title}
        </div>
      </div>

      {/* Coins badge */}
      <div className={`
        flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold
        ${isCompleted ? "coin-gradient text-primary-foreground" : "bg-secondary text-secondary-foreground"}
      `}>
        <span>+{task.coins}</span>
        <span className="text-base">🪙</span>
      </div>

      {/* Check mark */}
      <motion.div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-2xl
          ${isCompleted ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}
        `}
        animate={isCompleted ? { scale: [0, 1.2, 1] } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {isCompleted ? "✓" : "○"}
      </motion.div>
    </motion.button>
  );
}
