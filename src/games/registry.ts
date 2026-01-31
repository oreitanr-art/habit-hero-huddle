// Game registry - metadata for all mini-games
import { GameId, GameMeta } from "./types";

export const GAMES: GameMeta[] = [
  {
    id: "memory_flip",
    title: "זיכרון קלפים",
    iconEmoji: "🃏",
    short: "מצא זוגות",
    skill: "זיכרון",
    estimatedMin: 3,
    color: "pink",
  },
  {
    id: "math_sprint",
    title: "ספרינט חשבון",
    iconEmoji: "➕",
    short: "חיבור וחיסור מהיר",
    skill: "חשבון",
    estimatedMin: 2,
    color: "blue",
  },
  {
    id: "word_builder",
    title: "בונה מילים",
    iconEmoji: "🔤",
    short: "סדר אותיות למילה",
    skill: "שפה",
    estimatedMin: 3,
    color: "yellow",
  },
  {
    id: "pattern_simon",
    title: "סיימון צבעים",
    iconEmoji: "🎨",
    short: "זכור את הרצף",
    skill: "זיכרון",
    estimatedMin: 3,
    color: "green",
  },
  {
    id: "bubble_pop",
    title: "פיצוץ בועות",
    iconEmoji: "🫧",
    short: "לחץ על הבועות",
    skill: "מהירות",
    estimatedMin: 1,
    color: "pink",
  },
  {
    id: "slider_puzzle",
    title: "פאזל החלקה",
    iconEmoji: "🧩",
    short: "סדר את המספרים",
    skill: "לוגיקה",
    estimatedMin: 4,
    color: "yellow",
  },
  {
    id: "maze_dash",
    title: "מבוך מהיר",
    iconEmoji: "🏃",
    short: "הגע ליציאה",
    skill: "תכנון",
    estimatedMin: 2,
    color: "green",
  },
  {
    id: "typing_ninja",
    title: "נינג'ה הקלדה",
    iconEmoji: "⌨️",
    short: "הקלד מהר",
    skill: "הקלדה",
    estimatedMin: 2,
    color: "blue",
  },
  {
    id: "spot_difference",
    title: "מצא הבדלים",
    iconEmoji: "🔍",
    short: "3 הבדלים בין תמונות",
    skill: "קשב",
    estimatedMin: 2,
    color: "pink",
  },
  {
    id: "shape_sorter",
    title: "מיין צורות",
    iconEmoji: "🔺",
    short: "שים צורות במקומן",
    skill: "לוגיקה",
    estimatedMin: 2,
    color: "yellow",
  },
  {
    id: "rhythm_tap",
    title: "טאפ קצב",
    iconEmoji: "🥁",
    short: "לחץ בזמן הנכון",
    skill: "קצב",
    estimatedMin: 1,
    color: "green",
  },
  {
    id: "logic_path",
    title: "מסלול מספרים",
    iconEmoji: "🔢",
    short: "לחץ 1→16 בסדר",
    skill: "לוגיקה",
    estimatedMin: 2,
    color: "blue",
  },
];

// Pick 3 random games for daily offers based on date seed
export function pickDailyOffers(dateISO: string): GameId[] {
  const seed = parseInt(dateISO.replace(/-/g, ""), 10);
  const shuffled = [...GAMES].sort((a, b) => {
    const ha = hashCode(a.id + seed);
    const hb = hashCode(b.id + seed);
    return ha - hb;
  });
  return shuffled.slice(0, 3).map((g) => g.id);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export type { GameId };
