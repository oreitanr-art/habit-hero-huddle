import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: string;
  highlight?: string; // CSS selector to highlight
}

const tourSteps: TourStep[] = [
  {
    title: "ברוכים הבאים! 🎉",
    description: "זוהי אפליקציית מטלות יומיות שמלמדת ילדים אחריות תוך כדי הנאה. בואו נלמד איך להשתמש בה!",
    icon: "🪙",
  },
  {
    title: "רשימת המטלות",
    description: "כאן הילד רואה את המטלות היומיות. כל מטלה שמסיימים - לוחצים עליה לסימון ✓",
    icon: "✅",
  },
  {
    title: "צבירת מטבעות",
    description: "על כל מטלה שהילד מסיים הוא מקבל מטבעות. יש גם בונוסים על השלמת הכל ורצפים!",
    icon: "🪙",
  },
  {
    title: "שליחת המטלות",
    description: "בסיום - לוחצים על 'שלח את המטלות!' כדי לנעול את היום ולקבל את המטבעות",
    icon: "📤",
  },
  {
    title: "מצב הורה",
    description: "לחצו על 'הורה' והזינו PIN כדי לערוך מטלות, פרסים ולצפות בהתקדמות",
    icon: "🔐",
  },
  {
    title: "החנות",
    description: "בסוף השבוע נפתחת החנות! הילד יכול לקנות פרסים במטבעות שצבר",
    icon: "🏪",
  },
  {
    title: "מוכנים להתחיל!",
    description: "זהו! עכשיו אתם יודעים הכל. בהצלחה וכיף! 🚀",
    icon: "🎯",
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Tour card */}
        <motion.div
          className="relative w-full max-w-sm card-kid z-10"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          key={currentStep}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute left-3 top-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="text-center pt-2">
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {step.icon}
            </motion.div>

            <h3 className="font-black text-xl mb-3">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {tourSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="btn-kid btn-ghost-kid flex-1 flex items-center justify-center gap-1"
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </button>
              )}

              <button
                onClick={handleNext}
                className="btn-kid btn-primary-kid flex-1 flex items-center justify-center gap-1"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    סיום
                  </>
                ) : (
                  <>
                    הבא
                    <ChevronLeft className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Skip link */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                דלג על ההדרכה
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
