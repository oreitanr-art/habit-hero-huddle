import { useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface Progress {
  bestTimeSec: number | null;
  plays: number;
}

type Cell = 0 | 1;

function genMaze(size = 9): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 1 as Cell)
  );
  let r = 0,
    c = 0;
  grid[r][c] = 0;
  while (r !== size - 1 || c !== size - 1) {
    if (r === size - 1) c++;
    else if (c === size - 1) r++;
    else Math.random() < 0.5 ? c++ : r++;
    grid[r][c] = 0;
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === 1 && Math.random() < 0.35) grid[i][j] = 0;
    }
  }
  grid[0][0] = 0;
  grid[size - 1][size - 1] = 0;
  return grid;
}

interface MazeDashGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function MazeDashGame({ walletCoins, onExit }: MazeDashGameProps) {
  const prog = getGameProgress<Progress>("maze_dash", { bestTimeSec: null, plays: 0 });
  const [grid, setGrid] = useState<Cell[][]>(() => genMaze());
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [startMs, setStartMs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  function reset() {
    setGrid(genMaze());
    setPos({ r: 0, c: 0 });
    setStartMs(null);
    setElapsed(0);
    setDone(false);
  }

  function move(dr: number, dc: number) {
    if (done) return;
    if (startMs == null) setStartMs(Date.now());
    const nr = pos.r + dr,
      nc = pos.c + dc;
    if (nr < 0 || nc < 0 || nr >= grid.length || nc >= grid.length) return;
    if (grid[nr][nc] === 1) return;
    setPos({ r: nr, c: nc });

    if (nr === grid.length - 1 && nc === grid.length - 1) {
      setDone(true);
      const sec = startMs ? Math.max(1, Math.round((Date.now() - startMs) / 1000)) : 1;
      setElapsed(sec);
      const before = getGameProgress<Progress>("maze_dash", { bestTimeSec: null, plays: 0 });
      const best = before.bestTimeSec == null ? sec : Math.min(before.bestTimeSec, sec);
      setGameProgress("maze_dash", { bestTimeSec: best, plays: before.plays + 1 });
    }
  }

  const currentElapsed = startMs && !done ? Math.floor((Date.now() - startMs) / 1000) : elapsed;

  return (
    <GameFrame
      title="מבוך מהיר"
      subtitle="הגע מהפינה לפינה. לחץ על החצים."
      onExit={onExit}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
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

      <div
        className="grid gap-0.5 mx-auto mb-4"
        style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)`, maxWidth: 280 }}
      >
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            const isPlayer = ri === pos.r && ci === pos.c;
            const isGoal = ri === grid.length - 1 && ci === grid.length - 1;
            return (
              <div
                key={`${ri}-${ci}`}
                className="aspect-square rounded-sm flex items-center justify-center text-xs"
                style={{
                  background:
                    cell === 1
                      ? "rgba(20,33,61,.25)"
                      : isPlayer
                      ? "rgba(59,130,246,.45)"
                      : isGoal
                      ? "rgba(34,197,94,.35)"
                      : "rgba(255,255,255,.8)",
                }}
              >
                {isPlayer && "🏃"}
                {isGoal && !isPlayer && "🏁"}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button className="btn-kid btn-ghost-kid p-2" onClick={() => move(-1, 0)}>
          <ArrowUp className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          <button className="btn-kid btn-ghost-kid p-2" onClick={() => move(0, 1)}>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="btn-kid btn-ghost-kid p-2" onClick={() => move(1, 0)}>
            <ArrowDown className="h-5 w-5" />
          </button>
          <button className="btn-kid btn-ghost-kid p-2" onClick={() => move(0, -1)}>
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      {done && (
        <div className="kid-toast mt-3">
          ✅ הגעת! זמן: <b className="ltr">{elapsed}s</b>
        </div>
      )}
    </GameFrame>
  );
}
