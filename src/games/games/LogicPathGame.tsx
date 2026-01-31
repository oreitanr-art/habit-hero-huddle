import { useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestTimeSec: number | null;
  plays: number;
}

function makeBoard(): number[] {
  const nums = Array.from({ length: 16 }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

interface LogicPathGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function LogicPathGame({ walletCoins, onExit }: LogicPathGameProps) {
  const prog = getGameProgress<Progress>("logic_path", { bestTimeSec: null, plays: 0 });
  const [board, setBoard] = useState<number[]>(() => makeBoard());
  const [next, setNext] = useState(1);
  const [startMs, setStartMs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  function reset() {
    setBoard(makeBoard());
    setNext(1);
    setStartMs(null);
    setElapsed(0);
    setDone(false);
  }

  function click(n: number) {
    if (done) return;
    if (startMs == null) setStartMs(Date.now());
    if (n !== next) return;

    if (n === 16) {
      const sec = startMs ? Math.max(1, Math.round((Date.now() - startMs) / 1000)) : 1;
      setElapsed(sec);
      setDone(true);
      const before = getGameProgress<Progress>("logic_path", {
        bestTimeSec: null,
        plays: 0,
      });
      const best = before.bestTimeSec == null ? sec : Math.min(before.bestTimeSec, sec);
      setGameProgress("logic_path", { bestTimeSec: best, plays: before.plays + 1 });
    } else {
      setNext((x) => x + 1);
    }
  }

  const currentElapsed = startMs && !done ? Math.floor((Date.now() - startMs) / 1000) : elapsed;

  return (
    <GameFrame
      title="מסלול מספרים"
      subtitle="לחץ על המספרים לפי הסדר 1→16."
      onExit={onExit}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          הבא: <b className="ltr">{next}</b>
        </div>
        <div className="badge-kid">
          זמן: <b className="ltr">{currentElapsed}s</b>
        </div>
        <div className="pill-kid">
          שיא: <b className="ltr">{prog.bestTimeSec ?? "—"}s</b>
        </div>
        <button className="btn-kid btn-ghost-kid" onClick={reset}>
          חדש
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-lg">
        {board.map((n, i) => (
          <button
            key={i}
            onClick={() => click(n)}
            className="h-16 rounded-2xl text-xl font-black transition-all"
            style={{
              background: n < next ? "rgba(34,197,94,.14)" : "rgba(255,255,255,.88)",
              border:
                n === next
                  ? "3px solid rgba(59,130,246,.55)"
                  : "1px solid rgba(20,33,61,.12)",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {done && (
        <div className="kid-toast mt-3">
          ✅ סיימת! זמן: <b className="ltr">{elapsed}s</b>
        </div>
      )}
    </GameFrame>
  );
}
