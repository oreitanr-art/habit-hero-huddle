import { useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestMoves: number | null;
  plays: number;
}

function solvableShuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const nums = a.filter((n) => n !== 0);
  let inv = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inv++;
    }
  }
  if (inv % 2 === 1) {
    const i = a.findIndex((n) => n !== 0);
    const j = a.findIndex((n, idx) => n !== 0 && idx !== i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SliderPuzzleGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function SliderPuzzleGame({ walletCoins, onExit }: SliderPuzzleGameProps) {
  const prog = getGameProgress<Progress>("slider_puzzle", { bestMoves: null, plays: 0 });
  const [tiles, setTiles] = useState<number[]>(() =>
    solvableShuffle([1, 2, 3, 4, 5, 6, 7, 8, 0])
  );
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  function reset() {
    setTiles(solvableShuffle([1, 2, 3, 4, 5, 6, 7, 8, 0]));
    setMoves(0);
    setDone(false);
  }

  function canSwap(i: number, z: number) {
    const r1 = Math.floor(i / 3),
      c1 = i % 3;
    const r2 = Math.floor(z / 3),
      c2 = z % 3;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  function click(i: number) {
    if (done) return;
    const z = tiles.indexOf(0);
    if (!canSwap(i, z)) return;
    const next = [...tiles];
    [next[i], next[z]] = [next[z], next[i]];
    setTiles(next);
    setMoves((m) => m + 1);

    const solved = next.join(",") === "1,2,3,4,5,6,7,8,0";
    if (solved) {
      setDone(true);
      const before = getGameProgress<Progress>("slider_puzzle", {
        bestMoves: null,
        plays: 0,
      });
      const best = before.bestMoves == null ? moves + 1 : Math.min(before.bestMoves, moves + 1);
      setGameProgress("slider_puzzle", { bestMoves: best, plays: before.plays + 1 });
    }
  }

  return (
    <GameFrame
      title="פאזל החלקה"
      subtitle="סדר את המספרים 1–8. הריבוע הריק עוזר להזיז."
      onExit={onExit}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          מהלכים: <b className="ltr">{moves}</b>
        </div>
        <div className="pill-kid">
          שיא: <b className="ltr">{prog.bestMoves ?? "—"}</b>
        </div>
        <button className="btn-kid btn-ghost-kid" onClick={reset}>
          ערבב מחדש
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {tiles.map((n, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={n === 0}
            className="h-20 rounded-2xl text-2xl font-black transition-all"
            style={{
              background: n === 0 ? "transparent" : "rgba(251,191,36,.25)",
              border: n === 0 ? "1px dashed rgba(20,33,61,.18)" : "1px solid rgba(20,33,61,.12)",
              cursor: n === 0 ? "default" : "pointer",
            }}
          >
            {n === 0 ? "" : n}
          </button>
        ))}
      </div>

      {done && (
        <div className="kid-toast mt-3">
          ✅ הצלחת! מהלכים: <b className="ltr">{moves}</b>
        </div>
      )}
    </GameFrame>
  );
}
