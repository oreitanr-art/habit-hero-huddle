import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAMES, pickDailyOffers, GameId } from "./registry";
import { getDailyOffers, saveDailyOffers } from "./storage";
import { getTodayKey } from "@/lib/morning-coins/date-utils";
import { X, Gamepad2 } from "lucide-react";

// Import all games
import { MemoryFlipGame } from "./games/MemoryFlipGame";
import { MathSprintGame } from "./games/MathSprintGame";
import { WordBuilderGame } from "./games/WordBuilderGame";
import { PatternSimonGame } from "./games/PatternSimonGame";
import { BubblePopGame } from "./games/BubblePopGame";
import { SliderPuzzleGame } from "./games/SliderPuzzleGame";
import { MazeDashGame } from "./games/MazeDashGame";
import { TypingNinjaGame } from "./games/TypingNinjaGame";
import { SpotDifferenceGame } from "./games/SpotDifferenceGame";
import { ShapeSorterGame } from "./games/ShapeSorterGame";
import { RhythmTapGame } from "./games/RhythmTapGame";
import { LogicPathGame } from "./games/LogicPathGame";

interface GameHubProps {
  walletCoins: number;
  mode: "offer" | "library";
  onClose: () => void;
}

export function GameHub({ walletCoins, mode, onClose }: GameHubProps) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const todayISO = getTodayKey();

  // Get or generate daily offers
  const offers = useMemo(() => {
    const existing = getDailyOffers(todayISO);
    if (existing && existing.length === 3) return existing;
    const picked = pickDailyOffers(todayISO);
    saveDailyOffers(todayISO, picked);
    return picked;
  }, [todayISO]);

  // Filter games based on mode
  const displayGames = mode === "offer" 
    ? GAMES.filter((g) => offers.includes(g.id))
    : GAMES;

  function startGame(id: GameId) {
    setActiveGame(id);
  }

  function exitGame() {
    setActiveGame(null);
  }

  // Render active game
  if (activeGame) {
    const common = { walletCoins, onExit: exitGame };
    
    const gameComponents: Record<GameId, React.ReactNode> = {
      memory_flip: <MemoryFlipGame {...common} />,
      math_sprint: <MathSprintGame {...common} />,
      word_builder: <WordBuilderGame {...common} />,
      pattern_simon: <PatternSimonGame {...common} />,
      bubble_pop: <BubblePopGame {...common} />,
      slider_puzzle: <SliderPuzzleGame {...common} />,
      maze_dash: <MazeDashGame {...common} />,
      typing_ninja: <TypingNinjaGame {...common} />,
      spot_difference: <SpotDifferenceGame {...common} />,
      shape_sorter: <ShapeSorterGame {...common} />,
      rhythm_tap: <RhythmTapGame {...common} />,
      logic_path: <LogicPathGame {...common} />,
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {gameComponents[activeGame]}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render game selection
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-kid"
    >
      <div className="card-header-kid mb-4">
        <div>
          <h2 className="h2-kid flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            {mode === "offer" ? "בחר משחק! 🎮" : "ספריית משחקים"}
          </h2>
          <p className="p-kid">
            {mode === "offer"
              ? "סיימת את המטלות! בחר משחק קצר כפרס:"
              : "כאן אפשר לשחק בכל המשחקים."}
          </p>
        </div>
        <button onClick={onClose} className="btn-kid btn-ghost-kid">
          <X className="h-4 w-4" />
          <span>סגור</span>
        </button>
      </div>

      <div className="shop-grid">
        {displayGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="shop-item"
          >
            <div className="flex items-center gap-3">
              <div
                className={`icon-bubble ${game.color}`}
                style={{ fontSize: 22 }}
              >
                {game.iconEmoji}
              </div>
              <div>
                <div className="shop-title">{game.title}</div>
                <div className="shop-desc">
                  {game.short} • {game.skill} • {game.estimatedMin} דק׳
                </div>
              </div>
            </div>
            <button
              className="btn-kid btn-primary-kid"
              onClick={() => startGame(game.id)}
            >
              שחק
            </button>
          </motion.div>
        ))}
      </div>

      {mode === "offer" && (
        <motion.div
          className="kid-toast mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          💡 המשחקים קצרים ושומרים התקדמות. בחר את מה שמתחשק לך!
        </motion.div>
      )}
    </motion.div>
  );
}
