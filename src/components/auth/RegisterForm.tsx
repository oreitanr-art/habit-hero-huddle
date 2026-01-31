import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const registerSchema = z.object({
  childName: z.string().trim().min(2, "שם הילד חייב להכיל לפחות 2 תווים").max(50),
  parentName: z.string().trim().min(2, "שם ההורה חייב להכיל לפחות 2 תווים").max(50),
  parentPhone: z.string().trim().regex(/^0\d{8,9}$/, "מספר טלפון לא תקין (לדוגמא: 0501234567)").optional().or(z.literal("")),
  email: z.string().trim().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמא חייבת להכיל לפחות 6 תווים").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות לא תואמות",
  path: ["confirmPassword"],
});

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    childName: "",
    parentName: "",
    parentPhone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "שגיאה",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) {
        toast({
          title: "שגיאה בהרשמה",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "שגיאה",
          description: "לא ניתן ליצור משתמש",
          variant: "destructive",
        });
        return;
      }

      // 2. Create the profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        parent_name: result.data.parentName,
        parent_email: result.data.email,
        parent_phone: result.data.parentPhone || null,
      });

      if (profileError) {
        toast({
          title: "שגיאה ביצירת פרופיל",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // 3. Create the first child
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (profile) {
        const { error: childError } = await supabase.from("children").insert({
          parent_id: profile.id,
          child_name: result.data.childName,
        });

        if (childError) {
          console.error("Error creating child:", childError);
        }
      }

      toast({
        title: "נרשמת בהצלחה! 🎉",
        description: "בדוק את האימייל שלך לאישור ההרשמה",
      });
      
      // Navigate to home - auth state will update
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (error) {
        toast({
          title: "שגיאה בהתחברות עם גוגל",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="card-kid">
      <form onSubmit={handleRegister}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="childName" className="font-bold">שם הילד/ה</Label>
            <Input
              id="childName"
              type="text"
              placeholder="למשל: יוסי"
              value={formData.childName}
              onChange={(e) => updateField("childName", e.target.value)}
              className="input-kid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentName" className="font-bold">שם ההורה</Label>
            <Input
              id="parentName"
              type="text"
              placeholder="למשל: דני"
              value={formData.parentName}
              onChange={(e) => updateField("parentName", e.target.value)}
              className="input-kid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone" className="font-bold">טלפון (אופציונלי)</Label>
            <Input
              id="parentPhone"
              type="tel"
              placeholder="0501234567"
              value={formData.parentPhone}
              onChange={(e) => updateField("parentPhone", e.target.value)}
              dir="ltr"
              className="input-kid text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerEmail" className="font-bold">אימייל</Label>
            <Input
              id="registerEmail"
              type="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              dir="ltr"
              className="input-kid text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerPassword" className="font-bold">סיסמא</Label>
            <Input
              id="registerPassword"
              type="password"
              placeholder="לפחות 6 תווים"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              dir="ltr"
              className="input-kid text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-bold">אימות סיסמא</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="הזן שוב את הסיסמא"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              dir="ltr"
              className="input-kid text-left"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            type="submit"
            className="btn-kid btn-secondary-kid w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "הירשם"
            )}
          </button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">או</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-kid btn-ghost-kid w-full flex items-center justify-center gap-2"
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                הירשם עם גוגל
              </>
            )}
          </button>

          <p className="text-sm text-muted-foreground text-center">
            יש לך כבר חשבון?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-bold"
            >
              התחבר
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
