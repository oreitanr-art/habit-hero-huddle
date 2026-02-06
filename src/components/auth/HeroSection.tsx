import { motion } from "framer-motion";
import appIcon from "@/assets/app-icon.png";

const floatingEmojis = [
  { emoji: "🪙", x: "10%", y: "15%", delay: 0, size: "text-3xl" },
  { emoji: "⭐", x: "85%", y: "10%", delay: 0.5, size: "text-2xl" },
  { emoji: "🎯", x: "5%", y: "70%", delay: 1, size: "text-2xl" },
  { emoji: "🏆", x: "90%", y: "65%", delay: 1.5, size: "text-3xl" },
  { emoji: "✅", x: "75%", y: "85%", delay: 0.8, size: "text-xl" },
  { emoji: "🎉", x: "20%", y: "90%", delay: 1.2, size: "text-2xl" },
];

const features = [
  { icon: "🪙", text: "צוברים מטבעות על משימות בוקר" },
  { icon: "🎁", text: "ממירים מטבעות לפרסים אמיתיים" },
  { icon: "📊", text: "עוקבים אחרי ההתקדמות ביחד" },
];

export const HeroSection = () => {
  return (
    <div className="relative text-center mb-6">
      {/* Floating emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} pointer-events-none select-none opacity-20`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            delay: item.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Logo */}
      <motion.div
        className="inline-block mb-3 relative"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
      >
        <img
          src={appIcon}
          alt="היכון, הכן, צ'ק!"
          className="w-20 h-20 mx-auto rounded-2xl shadow-lift"
        />
        <motion.div
          className="absolute -top-1 -left-1 text-lg"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
        >
          ✨
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-[32px] font-black tracking-tight leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="bg-gradient-to-l from-primary via-rsc-sky to-primary-700 bg-clip-text text-transparent">
          היכון
        </span>
        <span className="text-foreground">, </span>
        <span className="bg-gradient-to-l from-rsc-gold-deep via-rsc-gold to-rsc-gold-light bg-clip-text text-transparent">
          הכן
        </span>
        <span className="text-foreground">, </span>
        <span className="bg-gradient-to-l from-rsc-mint to-success bg-clip-text text-transparent">
          צ׳ק!
        </span>
      </motion.h1>

      <motion.p
        className="p-kid mt-2 text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        הדרך הכי כיפית לבנות שגרת בוקר מנצחת 🚀
      </motion.p>

      {/* Feature pills */}
      <motion.div
        className="flex flex-col gap-2 mt-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.12 }}
          >
            <span className="text-xl flex-shrink-0">{feature.icon}</span>
            <span className="text-sm font-bold text-foreground">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
