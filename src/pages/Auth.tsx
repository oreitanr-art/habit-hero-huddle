import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { CoinIcon } from "@/design/icons";

type AuthView = "login" | "register";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 kid-container" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <CoinIcon size={80} />
          </motion.div>
          <h1 className="h1-kid">Morning Coins</h1>
          <p className="p-kid">
            מערכת תגמול משפחתית לבקרים מוצלחים
          </p>
        </div>

        {/* Auth tabs */}
        <div className="tabs-kid mb-6">
          <button
            onClick={() => setView("login")}
            className={`tab-kid flex-1 ${view === "login" ? "tab-kid-active" : ""}`}
          >
            התחברות
          </button>
          <button
            onClick={() => setView("register")}
            className={`tab-kid flex-1 ${view === "register" ? "tab-kid-active" : ""}`}
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
