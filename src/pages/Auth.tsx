import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

type AuthView = "login" | "register";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            🪙
          </motion.div>
          <h1 className="text-3xl font-bold">Morning Coins</h1>
          <p className="text-muted-foreground mt-2">
            מערכת תגמול משפחתית לבקרים מוצלחים
          </p>
        </div>

        {/* Auth tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView("login")}
            className={`
              flex-1 py-3 rounded-xl font-bold transition-all
              ${view === "login" 
                ? "coin-gradient text-primary-foreground" 
                : "bg-secondary"
              }
            `}
          >
            התחברות
          </button>
          <button
            onClick={() => setView("register")}
            className={`
              flex-1 py-3 rounded-xl font-bold transition-all
              ${view === "register" 
                ? "coin-gradient text-primary-foreground" 
                : "bg-secondary"
              }
            `}
          >
            הרשמה
          </button>
        </div>

        {/* Forms */}
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
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RegisterForm onSwitchToLogin={() => setView("login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
};

export default Auth;
