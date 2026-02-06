import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { z } from "zod";

const emailSchema = z.string().trim().email("אימייל לא תקין");

interface EmailStepProps {
  value: string;
  onNext: (email: string) => void;
  onBack: () => void;
}

export const EmailStep = ({ value, onNext, onBack }: EmailStepProps) => {
  const [email, setEmail] = useState(value);
  const [error, setError] = useState("");

  const handleNext = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    onNext(result.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="card-kid space-y-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">📧</div>
        <h2 className="h2-kid">מה האימייל שלך?</h2>
        <p className="p-kid">נשתמש בו להתחברות ושחזור סיסמא</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="font-bold">אימייל</Label>
        <Input
          id="email"
          type="email"
          placeholder="parent@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          dir="ltr"
          className="input-kid text-left"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
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
