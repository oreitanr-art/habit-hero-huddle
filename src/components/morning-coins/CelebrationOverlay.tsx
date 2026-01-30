import { motion, AnimatePresence } from "framer-motion";

interface CelebrationOverlayProps {
  isVisible: boolean;
  message?: string;
  coins?: number;
}

export function CelebrationOverlay({ isVisible, message = "כל הכבוד!", coins }: CelebrationOverlayProps) {
  const emojis = ["🌟", "✨", "🎉", "🪙", "💫", "⭐"];
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Floating emojis */}
          {emojis.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl"
              initial={{ 
                opacity: 0, 
                x: Math.random() * 200 - 100,
                y: 100 
              }}
              animate={{ 
                opacity: [0, 1, 0],
                y: -200,
                x: Math.random() * 300 - 150,
              }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.1,
                ease: "easeOut"
              }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Central message */}
          <motion.div
            className="bg-card rounded-3xl p-8 shadow-lift text-center"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div 
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: 2, duration: 0.3 }}
            >
              🏆
            </motion.div>
            <h2 className="text-2xl font-bold text-primary mb-2">{message}</h2>
            {coins !== undefined && (
              <div className="flex items-center justify-center gap-2 text-xl">
                <span className="font-bold">+{coins}</span>
                <span>🪙</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
