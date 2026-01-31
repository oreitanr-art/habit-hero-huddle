import { useEffect, useRef, useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestScore: number;
  plays: number;
}

interface MathSprintGameProps {
  walletCoins: number;
  onExit: () => void;
}

function randInt(min: number, max: number, seedRef: React.MutableRefObject<number>) {
  seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0;
  const r = seedRef.current / 2 ** 32;
  return Math.floor(min + r * (max - min + 1));
}

export function MathSprintGame({ walletCoins, onExit }: MathSprintGameProps) {
  const prog = getGameProgress<Progress>("math_sprint", { bestScore: 0, plays: 0 });
  const seedRef = useRef<number>(Date.now());

  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState<"+" | "-">("+");
  const [feedback, setFeedback] = useState("");

  function newQ() {
    const x = randInt(1, 20, seedRef);
    const y = randInt(1, 20, seedRef);
    const o = randInt(0, 1, seedRef) === 0 ? "+" : "-";
    let aa = x,
      bb = y;
    if (o === "-" && y > x) {
      aa = y;
      bb = x;
    }
    setA(aa);
    setB(bb);
    setOp(o as "+" | "-");
  }

  useEffect(() => {
    newQ();
  }, []);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setFeedback("⏱️ נגמר הזמן!");
      const before = getGameProgress<Progress>("math_sprint", { bestScore: 0, plays: 0 });
      setGameProgress("math_sprint", {
        bestScore: Math.max(before.bestScore, score),
        plays: before.plays + 1,
      });
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, score]);

  const answer = op === "+" ? a + b : a - b;

  function start() {
    setScore(0);
    setTimeLeft(60);
    setInput("");
    setFeedback("");
    newQ();
    setRunning(true);
  }

  function submit() {
    if (!running) return;
    const val = Number(input);
    if (!Number.isFinite(val)) return;
    if (val === answer) {
      setScore((s) => s + 1);
      setFeedback("✅ נכון!");
    } else {
      setFeedback("❌ כמעט…");
    }
    setInput("");
    newQ();
  }

  return (
    <GameFrame
      title="ספרינט חשבון"
      subtitle="פתור כמה שיותר תרגילים ב-60 שניות."
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

      {!running && (
        <button className="btn-kid btn-primary-kid" onClick={start}>
          התחל
        </button>
      )}

      <div className="mt-3 grid gap-3 max-w-md">
        <div className="text-4xl font-black">
          <span className="ltr">
            {a} {op} {b} = ?
          </span>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <input
            className="input-kid ltr w-40 text-lg font-black"
            type="number"
            value={input}
            disabled={!running}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="תשובה"
          />
          <button
            className="btn-kid btn-secondary-kid"
            onClick={submit}
            disabled={!running || input.trim() === ""}
          >
            בדוק
          </button>
        </div>

        {feedback && <div className="kid-toast">{feedback}</div>}
      </div>

      {!running && prog.plays > 0 && (
        <div className="kid-toast mt-3">
          שיחקת {prog.plays} פעמים. נסה לשבור שיא!
        </div>
      )}
    </GameFrame>
  );
}
