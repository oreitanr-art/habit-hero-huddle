import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";

const completeProfileSchema = z.object({
  childName: z.string().trim().min(2, "שם הילד חייב להכיל לפחות 2 תווים").max(50),
  parentName: z.string().trim().min(2, "שם ההורה חייב להכיל לפחות 2 תווים").max(50),
  parentPhone: z.string().trim().regex(/^0\d{8,9}$/, "מספר טלפון לא תקין").optional().or(z.literal("")),
});

export const CompleteProfileForm = () => {
  const { user, refreshProfile, refreshChildren } = useAuth();
  const [formData, setFormData] = useState({
    childName: "",
    parentName: "",
    parentPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = completeProfileSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "שגיאה",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      // Create the profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        parent_name: result.data.parentName,
        parent_email: user.email || "",
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

      // Get the profile ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // Create the first child
        const { error: childError } = await supabase.from("children").insert({
          parent_id: profile.id,
          child_name: result.data.childName,
        });

        if (childError) {
          console.error("Error creating child:", childError);
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
    <main className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            🪙
          </motion.div>
          <h1 className="text-3xl font-bold">כמעט סיימנו!</h1>
          <p className="text-muted-foreground mt-2">
            מלא את הפרטים האחרונים כדי להתחיל
          </p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>השלמת פרטים</CardTitle>
            <CardDescription>הפרטים האלה יעזרו להתאים את האפליקציה עבורך</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">שם הילד/ה</Label>
                <Input
                  id="childName"
                  type="text"
                  placeholder="למשל: יוסי"
                  value={formData.childName}
                  onChange={(e) => updateField("childName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName">שם ההורה</Label>
                <Input
                  id="parentName"
                  type="text"
                  placeholder="למשל: דני"
                  value={formData.parentName}
                  onChange={(e) => updateField("parentName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">טלפון (אופציונלי)</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="0501234567"
                  value={formData.parentPhone}
                  onChange={(e) => updateField("parentPhone", e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full coin-gradient text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "בואו נתחיל! 🚀"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </main>
  );
};
