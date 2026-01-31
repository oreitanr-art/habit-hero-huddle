import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface GameFrameProps {
  title: string;
  subtitle?: string;
  onExit: () => void;
  coins: number;
  children: React.ReactNode;
}

export function GameFrame({ title, subtitle, onExit, coins, children }: GameFrameProps) {
  return (
    <motion.div 
      className="card-kid"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="card-header-kid mb-4">
        <div>
          <h2 className="h2-kid">{title}</h2>
          {subtitle && <p className="p-kid">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="coin-badge">
            <span className="text-lg">🪙</span>
            <span>{coins}</span>
          </div>
          <button 
            onClick={onExit}
            className="btn-kid btn-ghost-kid flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4" />
            <span>חזרה</span>
          </button>
        </div>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}
