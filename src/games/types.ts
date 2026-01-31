// Game types for morning coins mini-games

export type GameId =
  | "memory_flip"
  | "math_sprint"
  | "word_builder"
  | "pattern_simon"
  | "bubble_pop"
  | "slider_puzzle"
  | "maze_dash"
  | "typing_ninja"
  | "spot_difference"
  | "shape_sorter"
  | "rhythm_tap"
  | "logic_path";

export interface GameMeta {
  id: GameId;
  title: string;
  iconEmoji: string;
  short: string;
  skill: string;
  estimatedMin: number;
  color: "pink" | "yellow" | "green" | "blue";
}

export interface GameProgress {
  [key: string]: any;
}

export interface GameState {
  dailyOffers: Record<string, GameId[]>;
  progress: Record<GameId, GameProgress>;
  lastPlayedGameId?: GameId;
}

export interface GameProps {
  walletCoins: number;
  onExit: () => void;
}
