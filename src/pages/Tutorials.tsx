import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Baby } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TutorialCard } from "@/components/tutorials/TutorialCard";
import { tutorials, Tutorial } from "@/components/tutorials/TutorialData";
import { CoinIcon } from "@/design/icons";

type FilterType = "all" | "parent" | "child";

export default function Tutorials() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTutorials = tutorials.filter((t) => {
    if (filter === "all") return true;
    if (filter === "parent") return t.audience === "parent" || t.audience === "both";
    if (filter === "child") return t.audience === "child" || t.audience === "both";
    return true;
  });

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
            <h1 className="font-black text-xl">מדריכי שימוש</h1>
          </div>
          <motion.button
            onClick={() => navigate("/")}
            className="btn-kid btn-ghost-kid flex items-center gap-1"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="h-4 w-4" />
            חזרה
          </motion.button>
        </div>
      </motion.header>

      {/* Intro */}
      <motion.div
        className="card-kid bg-primary/5 border-primary/20 mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
        <h2 className="font-black text-xl mb-2">ברוכים הבאים! 👋</h2>
        <p className="text-muted-foreground">
          כאן תמצאו הסברים מפורטים על כל התכונות באפליקציה
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="tabs-kid mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`tab-kid flex-1 ${filter === "all" ? "tab-kid-active" : ""}`}
        >
          <Users className="h-4 w-4 inline ml-1" />
          הכל
        </button>
        <button
          onClick={() => setFilter("parent")}
          className={`tab-kid flex-1 ${filter === "parent" ? "tab-kid-active" : ""}`}
        >
          🔐 להורים
        </button>
        <button
          onClick={() => setFilter("child")}
          className={`tab-kid flex-1 ${filter === "child" ? "tab-kid-active" : ""}`}
        >
          <Baby className="h-4 w-4 inline ml-1" />
          לילדים
        </button>
      </div>

      {/* Tutorial list */}
      <div className="space-y-4">
        {filteredTutorials.map((tutorial, index) => (
          <TutorialCard
            key={tutorial.id}
            {...tutorial}
            index={index}
            isExpanded={expandedId === tutorial.id}
            onToggle={() => handleToggle(tutorial.id)}
          />
        ))}
      </div>

      {/* Quick tips */}
      <motion.div
        className="mt-8 card-kid bg-coin/10 border-coin/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-black text-lg mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          טיפים מהירים
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>קוד PIN ברירת מחדל: <strong>1234</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>החנות נפתחת בסוף השבוע (שישי-שבת)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>השלמת כל המטלות = בונוס מטבעות!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>3 ימים רצופים = בונוס רצף 🔥</span>
          </li>
        </ul>
      </motion.div>
    </main>
  );
}
