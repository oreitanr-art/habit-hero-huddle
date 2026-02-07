import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { StepIndicator } from "./registration/StepIndicator";
import { ParentNameStep } from "./registration/ParentNameStep";
import { ChildInfoStep, type ChildData } from "./registration/ChildInfoStep";
import { AddChildPrompt } from "./registration/AddChildPrompt";
import { EmailStep } from "./registration/EmailStep";
import { PhoneStep } from "./registration/PhoneStep";
import { PasswordStep } from "./registration/PasswordStep";

const MAX_CHILDREN = 4;

// Steps: parentName -> childInfo(0) -> addChildPrompt -> [childInfo(1) -> addChildPrompt -> ...] -> email -> phone -> password
type WizardStep =
  | { type: "parentName" }
  | { type: "childInfo"; index: number }
  | { type: "addChildPrompt" }
  | { type: "email" }
  | { type: "phone" }
  | { type: "password" };

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [step, setStep] = useState<WizardStep>({ type: "parentName" });
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState<ChildData[]>([{ name: "", birthDate: "" }]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate which visual step we're on for the progress indicator
  const getProgressStep = (): number => {
    switch (step.type) {
      case "parentName": return 0;
      case "childInfo": return 1;
      case "addChildPrompt": return 2;
      case "email": return 3;
      case "phone": return 4;
      case "password": return 5;
      default: return 0;
    }
  };

  const handleRegister = async (password: string) => {
    setIsLoading(true);
    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
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
        parent_name: parentName,
        parent_email: email,
        parent_phone: phone || null,
      });

      if (profileError) {
        toast({
          title: "שגיאה ביצירת פרופיל",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // 3. Get profile ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (profile) {
        // 4. Create all children
        for (const child of children) {
          const { error: childError } = await supabase.from("children").insert({
            parent_id: profile.id,
            child_name: child.name,
            birth_date: child.birthDate || null,
          });
          if (childError) {
            console.error("Error creating child:", childError);
          }
        }
      }

      // If session exists, user is auto-confirmed → go straight to dashboard
      if (authData.session) {
        toast({
          title: "נרשמת בהצלחה! 🎉",
          description: "ברוכים הבאים למערכת!",
        });
      } else {
        toast({
          title: "נרשמת בהצלחה! 🎉",
          description: "בדוק את האימייל שלך לאישור ההרשמה",
        });
      }

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

  const updateChild = (index: number, data: ChildData) => {
    setChildren((prev) => {
      const updated = [...prev];
      updated[index] = data;
      return updated;
    });
  };

  const addNewChild = () => {
    const newIndex = children.length;
    setChildren((prev) => [...prev, { name: "", birthDate: "" }]);
    setStep({ type: "childInfo", index: newIndex });
  };

  return (
    <div>
      <StepIndicator totalSteps={6} currentStep={getProgressStep()} />

      <AnimatePresence mode="wait">
        {step.type === "parentName" && (
          <ParentNameStep
            key="parentName"
            value={parentName}
            onNext={(name) => {
              setParentName(name);
              setStep({ type: "childInfo", index: 0 });
            }}
          />
        )}

        {step.type === "childInfo" && (
          <ChildInfoStep
            key={`childInfo-${step.index}`}
            childIndex={step.index}
            value={children[step.index] || { name: "", birthDate: "" }}
            onNext={(child) => {
              updateChild(step.index, child);
              setStep({ type: "addChildPrompt" });
            }}
            onBack={() => {
              if (step.index === 0) {
                setStep({ type: "parentName" });
              } else {
                // Go back to the prompt (which will show all previously added children)
                setStep({ type: "addChildPrompt" });
              }
            }}
          />
        )}

        {step.type === "addChildPrompt" && (
          <AddChildPrompt
            key="addChildPrompt"
            childCount={children.length}
            maxChildren={MAX_CHILDREN}
            childrenNames={children.map((c) => c.name)}
            onAddChild={addNewChild}
            onContinue={() => setStep({ type: "email" })}
            onBack={() => {
              const lastIndex = children.length - 1;
              setStep({ type: "childInfo", index: lastIndex });
            }}
          />
        )}

        {step.type === "email" && (
          <EmailStep
            key="email"
            value={email}
            onNext={(e) => {
              setEmail(e);
              setStep({ type: "phone" });
            }}
            onBack={() => setStep({ type: "addChildPrompt" })}
          />
        )}

        {step.type === "phone" && (
          <PhoneStep
            key="phone"
            value={phone}
            onNext={(p) => {
              setPhone(p);
              setStep({ type: "password" });
            }}
            onSkip={() => {
              setPhone("");
              setStep({ type: "password" });
            }}
            onBack={() => setStep({ type: "email" })}
          />
        )}

        {step.type === "password" && (
          <PasswordStep
            key="password"
            isLoading={isLoading}
            onSubmit={handleRegister}
            onBack={() => setStep({ type: "phone" })}
          />
        )}
      </AnimatePresence>

      {/* Google sign-in & switch to login - only show on first step */}
      {step.type === "parentName" && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">או</span>
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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                התחל עם גוגל
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
      )}
    </div>
  );
};
