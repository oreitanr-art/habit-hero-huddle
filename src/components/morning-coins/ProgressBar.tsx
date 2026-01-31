import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-black">{current} / {total}</span>
        </div>
      )}
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(180deg, hsl(var(--secondary)) 0%, #F59E0B 100%)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
}
