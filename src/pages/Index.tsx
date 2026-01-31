import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { ChildChecklist } from "@/components/morning-coins/ChildChecklist";
import { FridaySummary } from "@/components/morning-coins/FridaySummary";
import { ParentSettings } from "@/components/morning-coins/ParentSettings";
import { PinDialog } from "@/components/morning-coins/PinDialog";
import { ChildSelector } from "@/components/ChildSelector";
import { LogOut } from "lucide-react";

type Mode = "child" | "parent";
type View = "checklist" | "shop";

const Index = () => {
  const { selectedChild, signOut } = useAuth();
  const { store, isLoading, isShopDay } = useMorningCoinsCloud();
  const [mode, setMode] = useState<Mode>("child");
  const [childView, setChildView] = useState<View>("checklist");
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Update view when shop day changes
  useEffect(() => {
    if (isShopDay) {
      setChildView("shop");
    } else {
      setChildView("checklist");
    }
  }, [isShopDay]);

  if (isLoading || !store || !selectedChild) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          🪙
        </motion.div>
      </div>
    );
  }

  const handleParentClick = () => {
    if (mode === "parent") {
      setMode("child");
    } else {
      setShowPinDialog(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setMode("parent");
  };

  return (
    <main className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 bg-card/90 backdrop-blur-sm shadow-soft"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🪙</span>
            <ChildSelector />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleParentClick}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${
                  mode === "parent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              {mode === "parent" ? "🔓 חזרה לילד" : "🔐 הורה"}
            </motion.button>

            <motion.button
              onClick={signOut}
              className="p-2 rounded-xl bg-secondary text-secondary-foreground"
              whileTap={{ scale: 0.95 }}
              title="התנתק"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {mode === "parent" ? (
            <motion.div
              key="parent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ParentSettings />
            </motion.div>
          ) : (
            <motion.div
              key="child"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* View tabs for child (only if Friday/Saturday) */}
              {isShopDay && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setChildView("checklist")}
                    className={`
                      flex-1 py-3 rounded-xl font-bold transition-all
                      ${
                        childView === "checklist"
                          ? "coin-gradient text-primary-foreground"
                          : "bg-secondary"
                      }
                    `}
                  >
                    ✅ מטלות
                  </button>
                  <button
                    onClick={() => setChildView("shop")}
                    className={`
                      flex-1 py-3 rounded-xl font-bold transition-all
                      ${
                        childView === "shop"
                          ? "coin-gradient text-primary-foreground"
                          : "bg-secondary"
                      }
                    `}
                  >
                    🏪 חנות
                  </button>
                </div>
              )}

              {childView === "shop" && isShopDay ? (
                <FridaySummary />
              ) : (
                <ChildChecklist />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PIN Dialog */}
      <PinDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handlePinSuccess}
        correctPin={store.settings.pin}
      />
    </main>
  );
};

export default Index;
