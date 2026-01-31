import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, User, Settings, ShoppingBag, LogIn, UserPlus, ClipboardList } from "lucide-react";

type ViewType = "child-checklist" | "child-shop" | "parent-settings" | "auth-login" | "auth-register";

interface DevNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views = [
  { id: "child-checklist" as ViewType, label: "מטלות (ילד)", icon: ClipboardList, color: "bg-kid-sky" },
  { id: "child-shop" as ViewType, label: "חנות (ילד)", icon: ShoppingBag, color: "bg-kid-bubblegum" },
  { id: "parent-settings" as ViewType, label: "הגדרות (הורה)", icon: Settings, color: "bg-kid-sunshine" },
  { id: "auth-login" as ViewType, label: "התחברות", icon: LogIn, color: "bg-gray-500" },
  { id: "auth-register" as ViewType, label: "הרשמה", icon: UserPlus, color: "bg-gray-600" },
];

export const DevNavigation = ({ currentView, onViewChange }: DevNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" dir="ltr">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border-4 border-kid-sky p-4 min-w-[220px]"
          >
            <h3 className="font-black text-lg mb-3 text-kid-navy">🎨 תצוגות</h3>
            <div className="space-y-2">
              {views.map((view) => (
                <motion.button
                  key={view.id}
                  onClick={() => {
                    onViewChange(view.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentView === view.id
                      ? `${view.color} text-white`
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <view.icon className="h-5 w-5" />
                  <span className="font-bold text-sm">{view.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          isOpen ? "bg-red-500" : "bg-kid-sky"
        } text-white`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};

export type { ViewType };
