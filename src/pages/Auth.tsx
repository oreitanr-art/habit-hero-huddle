import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { HeroSection } from "@/components/auth/HeroSection";

type AuthView = "login" | "register" | "reset";

const Auth = () => {
  const { isRecoveryMode } = useAuth();
  const [view, setView] = useState<AuthView>("login");

  useEffect(() => {
    if (isRecoveryMode) {
      setView("reset");
    }
  }, [isRecoveryMode]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 kid-container" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Hero section with branding */}
        <HeroSection />

        {/* Auth tabs */}
        {view !== "reset" && (
          <motion.div
            className="tabs-kid mb-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setView("login")}
              className={`tab-kid flex-1 transition-all duration-200 ${view === "login" ? "tab-kid-active" : ""}`}
            >
              כבר יש לי חשבון
            </button>
            <button
              onClick={() => setView("register")}
              className={`tab-kid flex-1 transition-all duration-200 ${view === "register" ? "tab-kid-active" : ""}`}
            >
              בואו נתחיל! 🎉
            </button>
          </motion.div>
        )}

        {/* Forms */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <LoginForm onSwitchToRegister={() => setView("register")} />
              </motion.div>
            ) : view === "register" ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <RegisterForm onSwitchToLogin={() => setView("login")} />
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ResetPasswordForm onBackToLogin={() => setView("login")} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Social proof */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-6 opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1 }}
        >
          ✨ מאות משפחות כבר משתמשות
        </motion.p>
      </motion.div>
    </main>
  );
};

export default Auth;
