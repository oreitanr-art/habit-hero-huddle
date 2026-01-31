import { useEffect, useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestTimeSec: number | null;
  plays: number;
}

const EMOJIS = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🥝", "🍋", "🍑", "🍍", "🥥", "🥕", "🌽", "🍪", "🍩", "🧁"];

function makeGrids(seed: number) {
  const base = Array.from({ length: 16 }, (_, i) => EMOJIS[(seed + i) % EMOJIS.length]);
  const copy = [...base];
  const diffs = new Set<number>();
  while (diffs.size < 3) diffs.add(Math.floor(Math.random() * 16));
  diffs.forEach((idx) => {
    copy[idx] = EMOJIS[(seed + idx + 5) % EMOJIS.length];
  });
  return { left: base, right: copy, diffs: Array.from(diffs) };
}

interface SpotDifferenceGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function SpotDifferenceGame({ walletCoins, onExit }: SpotDifferenceGameProps) {
  const prog = getGameProgress<Progress>("spot_difference", { bestTimeSec: null, plays: 0 });
  const seed = Date.now();
  const [data, setData] = useState(() => makeGrids(seed));
  const [found, setFound] = useState<Set<number>>(new Set());
  const [startMs, setStartMs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  function reset() {
    setData(makeGrids(Date.now()));
    setFound(new Set());
    setStartMs(null);
    setElapsed(0);
    setDone(false);
  }

  function click(idx: number) {
    if (done) return;
    if (startMs == null) setStartMs(Date.now());
    if (data.diffs.includes(idx)) {
      setFound((prev) => new Set([...prev, idx]));
    }
  }

  useEffect(() => {
    if (!done && found.size === 3) {
      setDone(true);
      const sec = startMs ? Math.max(1, Math.round((Date.now() - startMs) / 1000)) : 1;
      setElapsed(sec);
      const before = getGameProgress<Progress>("spot_difference", { bestTimeSec: null, plays: 0 });
      const best = before.bestTimeSec == null ? sec : Math.min(before.bestTimeSec, sec);
      setGameProgress("spot_difference", { bestTimeSec: best, plays: before.plays + 1 });
    }
  }, [found, done, startMs]);

  const currentElapsed = startMs && !done ? Math.floor((Date.now() - startMs) / 1000) : elapsed;

  return (
    <GameFrame
      title="מצא את ההבדלים"
      subtitle="יש 3 הבדלים. לחץ על מה ששונה בצד ימין."
      onExit={onExit}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          נמצאו: <b className="ltr">{found.size}/3</b>
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

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <Grid title="שמאל" data={data.left} found={found} diffs={data.diffs} clickable={false} onClick={() => {}} />
        <Grid title="ימין" data={data.right} found={found} diffs={data.diffs} clickable={true} onClick={click} />
      </div>

      {done && (
        <div className="kid-toast mt-3">
          ✅ מצאת הכל! זמן: <b className="ltr">{elapsed}s</b>
        </div>
      )}
    </GameFrame>
  );
}

function Grid({
  title,
  data,
  found,
  diffs,
  clickable,
  onClick,
}: {
  title: string;
  data: string[];
  found: Set<number>;
  diffs: number[];
  clickable: boolean;
  onClick: (idx: number) => void;
}) {
  return (
    <div>
      <div className="font-black mb-2">{title}</div>
      <div className="grid grid-cols-4 gap-1">
        {data.map((e, idx) => {
          const isFound = found.has(idx);
          return (
            <button
              key={idx}
              onClick={() => clickable && onClick(idx)}
              disabled={!clickable}
              className="h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
              style={{
                border: isFound ? "2px solid rgba(34,197,94,.55)" : "1px solid rgba(20,33,61,.12)",
                background: isFound ? "rgba(34,197,94,.10)" : "rgba(255,255,255,.86)",
                cursor: clickable ? "pointer" : "default",
              }}
            >
              {e}
            </button>
          );
        })}
      </div>
    </div>
  );
}
