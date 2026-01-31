import { useEffect, useState, useRef } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestScore: number;
  plays: number;
}

const WORDS = ["אבא", "אמא", "בית", "ספר", "גן", "יום", "לילה", "שמש", "ירח", "כוכב", "עץ", "פרח"];

interface TypingNinjaGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function TypingNinjaGame({ walletCoins, onExit }: TypingNinjaGameProps) {
  const prog = getGameProgress<Progress>("typing_ninja", { bestScore: 0, plays: 0 });
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function newWord() {
    setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }

  function start() {
    setScore(0);
    setTimeLeft(45);
    setInput("");
    setMsg("");
    newWord();
    setRunning(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setMsg("⏱️ נגמר הזמן!");
      const before = getGameProgress<Progress>("typing_ninja", { bestScore: 0, plays: 0 });
      setGameProgress("typing_ninja", {
        bestScore: Math.max(before.bestScore, score),
        plays: before.plays + 1,
      });
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, score]);

  function handleChange(val: string) {
    setInput(val);
    if (val === currentWord) {
      setScore((s) => s + 1);
      setInput("");
      newWord();
      setMsg("✅");
      setTimeout(() => setMsg(""), 300);
    }
  }

  return (
    <GameFrame
      title="נינג'ה הקלדה"
      subtitle="הקלד את המילה מהר ככל האפשר."
      onExit={onExit}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          זמן: <b className="ltr">{timeLeft}s</b>
        </div>
        <div className="badge-kid">
          ניקוד: <b className="ltr">{score}</b>
        </div>
        <div className="pill-kid">
          שיא: <b className="ltr">{prog.bestScore}</b>
        </div>
      </div>

      {!running ? (
        <button className="btn-kid btn-primary-kid" onClick={start}>
          התחל
        </button>
      ) : (
        <div className="grid gap-4 max-w-sm">
          <div className="text-center">
            <div className="text-4xl font-black mb-2">{currentWord}</div>
            <div className="text-sm text-muted-foreground">הקלד את המילה</div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            className="input-kid text-center text-2xl font-black"
            dir="rtl"
            autoFocus
          />

          {msg && <div className="kid-toast justify-center">{msg}</div>}
        </div>
      )}

      {!running && prog.plays > 0 && timeLeft === 0 && (
        <div className="kid-toast mt-3">
          סוף! ניקוד: <b>{score}</b>
        </div>
      )}
    </GameFrame>
  );
}
