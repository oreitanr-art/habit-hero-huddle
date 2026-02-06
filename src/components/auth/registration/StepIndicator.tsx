import { motion } from "framer-motion";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export const StepIndicator = ({ totalSteps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i <= currentStep
              ? "bg-primary w-8"
              : "bg-muted/30 w-4"
          }`}
          initial={false}
          animate={{
            width: i <= currentStep ? 32 : 16,
            opacity: i <= currentStep ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
};
