import { motion } from "framer-motion";
import { CoinIcon } from "@/design/icons";

interface CoinDisplayProps {
  amount: number;
  label: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function CoinDisplay({ amount, label, size = "md", animate = false }: CoinDisplayProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const iconSizes = {
    sm: 22,
    md: 28,
    lg: 40,
  };

  const containerClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <motion.div
      className={`card-kid ${containerClasses[size]}`}
      initial={animate ? { scale: 0.9, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <motion.span
          className={`${sizeClasses[size]} font-black text-secondary`}
          key={amount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {amount}
        </motion.span>
        <motion.div 
          animate={animate ? { rotateY: [0, 360] } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <CoinIcon size={iconSizes[size]} />
        </motion.div>
      </div>
    </motion.div>
  );
}
