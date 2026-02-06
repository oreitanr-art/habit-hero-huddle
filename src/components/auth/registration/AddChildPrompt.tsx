import { motion } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";

interface AddChildPromptProps {
  childCount: number;
  maxChildren: number;
  childrenNames: string[];
  onAddChild: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export const AddChildPrompt = ({
  childCount,
  maxChildren,
  childrenNames,
  onAddChild,
  onContinue,
  onBack,
}: AddChildPromptProps) => {
  const canAdd = childCount < maxChildren;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="card-kid space-y-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
        <h2 className="h2-kid">רוצה להוסיף ילד/ה נוסף/ת?</h2>
        <p className="p-kid">
          {childCount === 1
            ? `${childrenNames[0]} נרשם/ה בהצלחה!`
            : `${childrenNames.join(", ")} נרשמו בהצלחה!`}
        </p>
      </div>

      {/* Summary of registered children */}
      <div className="space-y-2">
        {childrenNames.map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20"
          >
            <span className="text-xl">✅</span>
            <span className="font-bold">{name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {canAdd && (
          <button onClick={onAddChild} className="btn-kid btn-ghost-kid w-full flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            הוסף ילד/ה נוסף/ת ({childCount}/{maxChildren})
          </button>
        )}

        <button onClick={onContinue} className="btn-kid btn-primary-kid w-full flex items-center justify-center gap-2">
          המשך לשלב הבא
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button onClick={onBack} className="btn-kid btn-ghost-kid w-full text-sm opacity-70">
          → חזרה
        </button>
      </div>
    </motion.div>
  );
};
