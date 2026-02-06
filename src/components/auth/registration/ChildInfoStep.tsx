import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export interface ChildData {
  name: string;
  birthDate: string;
}

interface ChildInfoStepProps {
  childIndex: number;
  value: ChildData;
  onNext: (child: ChildData) => void;
  onBack: () => void;
}

export const ChildInfoStep = ({ childIndex, value, onNext, onBack }: ChildInfoStepProps) => {
  const [name, setName] = useState(value.name);
  const [birthDate, setBirthDate] = useState(value.birthDate);
  const [error, setError] = useState("");

  const handleNext = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("שם הילד חייב להכיל לפחות 2 תווים");
      return;
    }
    onNext({ name: trimmed, birthDate });
  };

  const isFirstChild = childIndex === 0;
  const emoji = ["👦", "👧", "🧒", "👶"][childIndex] || "🧒";

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="card-kid space-y-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">{emoji}</div>
        <h2 className="h2-kid">
          {isFirstChild ? "ספרו לנו על הילד/ה" : `ילד/ה מספר ${childIndex + 1}`}
        </h2>
        <p className="p-kid">מה השם ומתי יום ההולדת?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`childName-${childIndex}`} className="font-bold">שם הילד/ה</Label>
          <Input
            id={`childName-${childIndex}`}
            type="text"
            placeholder="למשל: יוסי"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="input-kid"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`childBirth-${childIndex}`} className="font-bold">תאריך לידה</Label>
          <Input
            id={`childBirth-${childIndex}`}
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            dir="ltr"
            className="input-kid text-left"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-kid btn-ghost-kid flex-1">
          → חזרה
        </button>
        <button onClick={handleNext} className="btn-kid btn-primary-kid flex-1">
          המשך ←
        </button>
      </div>
    </motion.div>
  );
};
