import { useState, useMemo } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestLevel: number;
  plays: number;
}

const WORDS = [
  "שמש",
  "ילד",
  "בית",
  "גן",
  "ספר",
  "עץ",
  "מים",
  "לחם",
  "דלת",
  "חלון",
  "שולחן",
  "כיסא",
  "מחברת",
  "עפרון",
  "תיק",
  "בלון",
  "כדור",
  "פרח",
  "ציפור",
  "דג",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface WordBuilderGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function WordBuilderGame({ walletCoins, onExit }: WordBuilderGameProps) {
  const prog = getGameProgress<Progress>("word_builder", { bestLevel: 0, plays: 0 });
  const [level, setLevel] = useState(1);
  const [wordIdx, setWordIdx] = useState(0);
  const word = WORDS[wordIdx % WORDS.length];
  const [shuffledLetters, setShuffledLetters] = useState<string[]>(() =>
    shuffle(word.split(""))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [msg, setMsg] = useState("");

  function nextWord() {
    const next = (wordIdx + 1) % WORDS.length;
    setWordIdx(next);
    const newWord = WORDS[next];
    setShuffledLetters(shuffle(newWord.split("")));
    setSelected([]);
    setMsg("");
  }

  function reset() {
    setLevel(1);
    setWordIdx(0);
    setShuffledLetters(shuffle(WORDS[0].split("")));
    setSelected([]);
    setMsg("");
  }

  function selectLetter(idx: number) {
    if (selected.includes(idx)) return;
    const newSelected = [...selected, idx];
    setSelected(newSelected);

    const built = newSelected.map((i) => shuffledLetters[i]).join("");

    if (built.length === word.length) {
      if (built === word) {
        setMsg("✅ נכון!");
        const newLevel = level + 1;
        setLevel(newLevel);

        const before = getGameProgress<Progress>("word_builder", { bestLevel: 0, plays: 0 });
        setGameProgress("word_builder", {
          bestLevel: Math.max(before.bestLevel, newLevel - 1),
          plays: before.plays,
        });

        setTimeout(() => nextWord(), 800);
      } else {
        setMsg("❌ נסה שוב");
        setTimeout(() => setSelected([]), 600);
      }
    }
  }

  function finish() {
    const before = getGameProgress<Progress>("word_builder", { bestLevel: 0, plays: 0 });
    setGameProgress("word_builder", {
      bestLevel: Math.max(before.bestLevel, level - 1),
      plays: before.plays + 1,
    });
    onExit();
  }

  const built = selected.map((i) => shuffledLetters[i]).join("");

  return (
    <GameFrame
      title="בונה מילים"
      subtitle="סדר את האותיות למילה נכונה."
      onExit={finish}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          שלב: <b className="ltr">{level}</b>
        </div>
        <div className="pill-kid">
          שיא: <b className="ltr">{prog.bestLevel}</b>
        </div>
        <button className="btn-kid btn-ghost-kid" onClick={reset}>
          מהתחלה
        </button>
      </div>

      <div className="text-center mb-4">
        <div className="text-2xl font-black mb-2">{built || "..."}</div>
        <div className="text-sm text-muted-foreground">({word.length} אותיות)</div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap mb-4">
        {shuffledLetters.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => selectLetter(idx)}
            disabled={selected.includes(idx)}
            className="h-14 w-14 rounded-xl text-2xl font-black transition-all"
            style={{
              background: selected.includes(idx)
                ? "rgba(59,130,246,.2)"
                : "linear-gradient(180deg, hsl(var(--secondary)), #F59E0B)",
              opacity: selected.includes(idx) ? 0.4 : 1,
              border: "1px solid rgba(20,33,61,.12)",
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          className="btn-kid btn-ghost-kid"
          onClick={() => setSelected([])}
          disabled={selected.length === 0}
        >
          נקה
        </button>
      </div>

      {msg && <div className="kid-toast mt-3 justify-center">{msg}</div>}
    </GameFrame>
  );
}
