import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { StepIndicator } from "./registration/StepIndicator";
import { ParentNameStep } from "./registration/ParentNameStep";
import { ChildInfoStep, type ChildData } from "./registration/ChildInfoStep";
import { AddChildPrompt } from "./registration/AddChildPrompt";
import { PhoneStep } from "./registration/PhoneStep";
import { Loader2 } from "lucide-react";
import appIcon from "@/assets/app-icon.png";

const MAX_CHILDREN = 4;

type WizardStep =
  | { type: "parentName" }
  | { type: "childInfo"; index: number }
  | { type: "addChildPrompt" }
  | { type: "phone" }
  | { type: "saving" };

export const CompleteProfileForm = () => {
  const { user, refreshProfile, refreshChildren } = useAuth();
  const [step, setStep] = useState<WizardStep>({ type: "parentName" });
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState<ChildData[]>([{ name: "", birthDate: "" }]);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getProgressStep = (): number => {
    switch (step.type) {
      case "parentName": return 0;
      case "childInfo": return 1;
      case "addChildPrompt": return 2;
      case "phone": return 3;
      case "saving": return 4;
      default: return 0;
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

  const handleFinish = async (phoneValue: string) => {
    if (!user) return;

    setStep({ type: "saving" });
    setIsLoading(true);
    try {
      // Create or update the profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          parent_name: parentName,
          parent_email: user.email || "",
          parent_phone: phoneValue || null,
        },
        { onConflict: "user_id" }
      );

      if (profileError) {
        toast({
          title: "שגיאה ביצירת פרופיל",
          description: profileError.message,
          variant: "destructive",
        });
        setStep({ type: "phone" });
        return;
      }

      // Get the profile ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
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

      toast({
        title: "הפרופיל נוצר בהצלחה! 🎉",
        description: "אתה מוכן להתחיל",
      });

      await refreshProfile();
      await refreshChildren();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 kid-container" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            className="inline-block mb-3"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <img src={appIcon} alt="היכון, הכן, צ׳ק!" className="w-16 h-16 mx-auto rounded-2xl shadow-lg" />
          </motion.div>
          <h1 className="h1-kid">כמעט סיימנו! 🎉</h1>
          <p className="p-kid">השלימו כמה פרטים ומתחילים</p>
        </div>

        <StepIndicator totalSteps={4} currentStep={getProgressStep()} />

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
              onContinue={() => setStep({ type: "phone" })}
              onBack={() => {
                const lastIndex = children.length - 1;
                setStep({ type: "childInfo", index: lastIndex });
              }}
            />
          )}

          {step.type === "phone" && (
            <PhoneStep
              key="phone"
              value={phone}
              onNext={(p) => {
                setPhone(p);
                handleFinish(p);
              }}
              onSkip={() => {
                setPhone("");
                handleFinish("");
              }}
              onBack={() => setStep({ type: "addChildPrompt" })}
            />
          )}

          {step.type === "saving" && (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-kid flex flex-col items-center justify-center py-12 gap-4"
            >
              <motion.div
                className="text-5xl"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                🪙
              </motion.div>
              <p className="h2-kid">מכין את הכל...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
};
