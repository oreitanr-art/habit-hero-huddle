import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PasswordStepProps {
  isLoading: boolean;
  onSubmit: (password: string) => void;
  onBack: () => void;
}

export const PasswordStep = ({ isLoading, onSubmit, onBack }: PasswordStepProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (password.length < 6) {
      setError("סיסמא חייבת להכיל לפחות 6 תווים");
      return;
    }
    if (password !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      return;
    }
    onSubmit(password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="card-kid space-y-6"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">🔐</div>
        <h2 className="h2-kid">בחר סיסמא</h2>
        <p className="p-kid">לפחות 6 תווים</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="font-bold">סיסמא</Label>
          <Input
            id="password"
            type="password"
            placeholder="לפחות 6 תווים"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            dir="ltr"
            className="input-kid text-left"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-bold">אימות סיסמא</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="הזן שוב את הסיסמא"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            dir="ltr"
            className="input-kid text-left"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-kid btn-ghost-kid flex-1" disabled={isLoading}>
          → חזרה
        </button>
        <button
          onClick={handleSubmit}
          className="btn-kid btn-secondary-kid flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            "🚀 !צאו לדרך"
          )}
        </button>
      </div>
    </motion.div>
  );
};
