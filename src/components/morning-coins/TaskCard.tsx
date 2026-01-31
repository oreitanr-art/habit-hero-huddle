import { motion } from "framer-motion";
import { Task } from "@/lib/morning-coins/types";
import { CoinIcon, CheckIcon } from "@/design/icons";

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
      className={`task-row w-full ${isCompleted ? "done" : ""}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div className="task-left">
        <motion.div 
          className={`icon-bubble ${isCompleted ? "green" : "yellow"}`}
          animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span className="text-2xl">{task.icon}</span>
        </motion.div>

        {/* Title */}
        <div className="task-title">
          {task.title}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Coins badge */}
        <div className={`coin-badge ${!isCompleted ? "opacity-70" : ""}`}>
          <span>+{task.coins}</span>
          <CoinIcon size={18} />
        </div>

        {/* Check mark */}
        <motion.div
          className="w-10 h-10 flex items-center justify-center"
          animate={isCompleted ? { scale: [0, 1.2, 1] } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {isCompleted ? (
            <CheckIcon size={36} />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-muted" />
          )}
        </motion.div>
      </div>
    </motion.button>
  );
}
