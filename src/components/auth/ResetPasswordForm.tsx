import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().trim().email("אימייל לא תקין"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "סיסמא חייבת להכיל לפחות 6 תווים"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "הסיסמאות לא תואמות",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({
  onBackToLogin,
}: {
  onBackToLogin: () => void;
}) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isRecoveryFlow = useMemo(() => {
    // Supabase recovery links typically set `#...&type=recovery`
    return (window.location.hash || "").includes("type=recovery");
  }, []);

  const sendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast({
        title: "שגיאה",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
        redirectTo: `${window.location.origin}/auth?reset=1`,
      });

      if (error) {
        toast({
          title: "לא ניתן לשלוח מייל איפוס",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "נשלח מייל איפוס",
        description: "בדוק את תיבת הדואר (וגם ספאם) ולחץ על הקישור במייל.",
      });
      onBackToLogin();
    } finally {
      setIsSending(false);
    }
  };

  const saveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      toast({
        title: "שגיאה",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: result.data.password,
      });

      if (error) {
        toast({
          title: "לא ניתן לעדכן סיסמה",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "הסיסמה עודכנה בהצלחה",
        description: "מעבירים אותך לאפליקציה...",
      });

      // clear URL fragment/query and go home
      window.history.replaceState({}, "", "/auth");
      navigate("/");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-kid">
      {isRecoveryFlow ? (
        <>
          <div className="text-center mb-6">
            <h2 className="h2-kid">קביעת סיסמה חדשה</h2>
            <p className="p-kid">בחר סיסמה חדשה לחשבון שלך</p>
          </div>

          <form onSubmit={saveNewPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-bold">
                סיסמה חדשה
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="input-kid text-left"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="font-bold">
                אימות סיסמה
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                dir="ltr"
                className="input-kid text-left"
              />
            </div>

            <button
              type="submit"
              className="btn-kid btn-secondary-kid w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "שמור סיסמה"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="h2-kid">איפוס סיסמה</h2>
            <p className="p-kid">נשלח לך מייל עם קישור לאיפוס סיסמה</p>
          </div>

          <form onSubmit={sendResetEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="font-bold">
                אימייל
              </Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="input-kid text-left"
              />
            </div>

            <button
              type="submit"
              className="btn-kid btn-secondary-kid w-full"
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "שלח קישור איפוס"
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="btn-kid btn-ghost-kid w-full"
            >
              חזרה להתחברות
            </button>
          </form>
        </>
      )}
    </div>
  );
}
