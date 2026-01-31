import { useEffect, useRef, useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestScore: number;
  plays: number;
}

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface BubblePopGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function BubblePopGame({ walletCoins, onExit }: BubblePopGameProps) {
  const prog = getGameProgress<Progress>("bubble_pop", { bestScore: 0, plays: 0 });
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const areaRef = useRef<HTMLDivElement | null>(null);

  function spawn() {
    const rect = areaRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 360;
    const h = rect?.height ?? 260;
    const size = 42 + Math.random() * 26;
    const x = Math.random() * (w - size);
    const y = Math.random() * (h - size);
    setBubbles((prev) => [
      ...prev.slice(-9),
      { id: `${Date.now()}_${Math.random()}`, x, y, size },
    ]);
  }

  useEffect(() => {
    if (!running) return;
    const t = setInterval(spawn, 650);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      const before = getGameProgress<Progress>("bubble_pop", { bestScore: 0, plays: 0 });
      setGameProgress("bubble_pop", {
        bestScore: Math.max(before.bestScore, score),
        plays: before.plays + 1,
      });
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, score]);

  function start() {
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
    setRunning(true);
  }

  function pop(id: string) {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  }

  return (
    <GameFrame
      title="פיצוץ בועות"
      subtitle="תפוס כמה שיותר ב-30 שניות."
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

      <div
        ref={areaRef}
        className="mt-3 h-72 rounded-2xl border border-dashed border-border relative overflow-hidden"
        style={{ background: "rgba(59,130,246,.06)" }}
      >
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            disabled={!running}
            className="absolute cursor-pointer border-2 border-accent/50 transition-transform hover:scale-110"
            style={{
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.size,
              borderRadius: 999,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,.85), rgba(244,114,182,.20))",
            }}
            aria-label="bubble"
          />
        ))}
      </div>

      {!running && timeLeft === 0 && (
        <div className="kid-toast mt-3">
          סוף! ניקוד: <b>{score}</b>
        </div>
      )}
    </GameFrame>
  );
}
