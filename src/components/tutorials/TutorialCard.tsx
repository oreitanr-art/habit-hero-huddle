import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface TutorialCardProps {
  title: string;
  description: string;
  icon: string;
  steps: string[];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TutorialCard({
  title,
  description,
  icon,
  steps,
  index,
  isExpanded,
  onToggle,
}: TutorialCardProps) {
  return (
    <motion.div
      className="card-kid overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-right"
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="font-black text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? -90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-4 mt-4 border-t border-border/50">
          <ol className="space-y-3">
            {steps.map((step, stepIndex) => (
              <motion.li
                key={stepIndex}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                transition={{ delay: stepIndex * 0.1 }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                  {stepIndex + 1}
                </span>
                <span className="text-sm leading-relaxed">{step}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
}
