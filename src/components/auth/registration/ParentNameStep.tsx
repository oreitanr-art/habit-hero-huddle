import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface ParentNameStepProps {
  value: string;
  onNext: (name: string) => void;
}

export const ParentNameStep = ({ value, onNext }: ParentNameStepProps) => {
  const [name, setName] = useState(value);
  const [error, setError] = useState("");

  const handleNext = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("שם ההורה חייב להכיל לפחות 2 תווים");
      return;
    }
    onNext(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="card-kid space-y-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">👋</div>
        <h2 className="h2-kid">!שלום</h2>
        <p className="p-kid">איך קוראים לך?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentName" className="font-bold">שם ההורה</Label>
        <Input
          id="parentName"
          type="text"
          placeholder="למשל: דני"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          className="input-kid"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <button onClick={handleNext} className="btn-kid btn-primary-kid w-full">
        המשך ←
      </button>
    </motion.div>
  );
};
