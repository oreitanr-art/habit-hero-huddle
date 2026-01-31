import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMorningCoinsCloud } from "@/hooks/useMorningCoinsCloud";
import { ChildChecklist } from "@/components/morning-coins/ChildChecklist";
import { FridaySummary } from "@/components/morning-coins/FridaySummary";
import { ParentSettings } from "@/components/morning-coins/ParentSettings";
import { PinDialog } from "@/components/morning-coins/PinDialog";
import { ChildSelector } from "@/components/ChildSelector";
import { CoinIcon } from "@/design/icons";
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
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <CoinIcon size={48} />
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
    <main className="min-h-screen pb-24 kid-container" dir="rtl">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 card-kid mb-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoinIcon size={32} />
            <ChildSelector />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleParentClick}
              className={`btn-kid ${mode === "parent" ? "btn-primary-kid" : "btn-ghost-kid"}`}
              whileTap={{ scale: 0.95 }}
            >
              {mode === "parent" ? "🔓 חזרה לילד" : "🔐 הורה"}
            </motion.button>

            <motion.button
              onClick={signOut}
              className="btn-kid btn-ghost-kid p-2"
              whileTap={{ scale: 0.95 }}
              title="התנתק"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
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
              <div className="tabs-kid mb-6">
                <button
                  onClick={() => setChildView("checklist")}
                  className={`tab-kid flex-1 ${childView === "checklist" ? "tab-kid-active" : ""}`}
                >
                  ✅ מטלות
                </button>
                <button
                  onClick={() => setChildView("shop")}
                  className={`tab-kid flex-1 ${childView === "shop" ? "tab-kid-active" : ""}`}
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
