import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { z } from "zod";

const phoneSchema = z.string().trim().regex(/^0\d{8,9}$/, "מספר טלפון לא תקין (לדוגמא: 0501234567)");

interface PhoneStepProps {
  value: string;
  onNext: (phone: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const PhoneStep = ({ value, onNext, onSkip, onBack }: PhoneStepProps) => {
  const [phone, setPhone] = useState(value);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!phone.trim()) {
      onSkip();
      return;
    }
    const result = phoneSchema.safeParse(phone);
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
        <div className="text-5xl mb-3">📱</div>
        <h2 className="h2-kid">מספר טלפון</h2>
        <p className="p-kid">אופציונלי - אפשר לדלג</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="font-bold">טלפון</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0501234567"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(""); }}
          dir="ltr"
          className="input-kid text-left"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button onClick={onBack} className="btn-kid btn-ghost-kid flex-1">
            → חזרה
          </button>
          <button onClick={handleNext} className="btn-kid btn-primary-kid flex-1">
            המשך ←
          </button>
        </div>
        <button onClick={onSkip} className="btn-kid btn-ghost-kid w-full text-sm opacity-70">
          דלג →
        </button>
      </div>
    </motion.div>
  );
};
