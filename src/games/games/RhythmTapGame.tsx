import { useEffect, useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestScore: number;
  plays: number;
}

interface RhythmTapGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function RhythmTapGame({ walletCoins, onExit }: RhythmTapGameProps) {
  const prog = getGameProgress<Progress>("rhythm_tap", { bestScore: 0, plays: 0 });
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [targetAt, setTargetAt] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [indicator, setIndicator] = useState(0);

  function scheduleNext() {
    const now = Date.now();
    const delay = 600 + Math.random() * 800;
    setTargetAt(now + delay);
  }

  function start() {
    setRunning(true);
    setTimeLeft(25);
    setScore(0);
    setMsg("");
    scheduleNext();
  }

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setMsg("סוף משחק!");
      const before = getGameProgress<Progress>("rhythm_tap", { bestScore: 0, plays: 0 });
      setGameProgress("rhythm_tap", {
        bestScore: Math.max(before.bestScore, score),
        plays: before.plays + 1,
      });
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, score]);

  useEffect(() => {
    if (!running || targetAt == null) return;
    const interval = setInterval(() => {
      const diff = targetAt - Date.now();
      setIndicator(Math.max(0, Math.min(100, 100 - (Math.abs(diff) / 800) * 100)));
    }, 50);
    return () => clearInterval(interval);
  }, [running, targetAt]);

  function tap() {
    if (!running || targetAt == null) return;
    const diff = Math.abs(Date.now() - targetAt);
    if (diff <= 140) {
      setScore((s) => s + 2);
      setMsg("🎯 מושלם!");
    } else if (diff <= 260) {
      setScore((s) => s + 1);
      setMsg("✅ טוב!");
    } else {
      setMsg("❌ מוקדם/מאוחר");
    }
    scheduleNext();
  }

  return (
    <GameFrame
      title="טאפ קצב"
      subtitle="לחץ כשהעיגול מגיע למרכז."
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
        <div className="max-w-lg mx-auto">
          <div className="h-4 rounded-full bg-border/30 overflow-hidden mb-2">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${indicator}%`,
                background: "linear-gradient(90deg, rgba(244,114,182,.35), rgba(59,130,246,.35))",
              }}
            />
          </div>
          <div className="flex justify-between text-sm opacity-70 mb-4">
            <span>מוקדם</span>
            <span>בול!</span>
            <span>מאוחר</span>
          </div>

          <button
            className="btn-kid btn-secondary-kid w-full h-20 text-xl"
            disabled={!running}
            onClick={tap}
          >
            TAP!
          </button>

          {msg && <div className="kid-toast mt-3 justify-center">{msg}</div>}
        </div>
      )}
    </GameFrame>
  );
}
