import { useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestLevel: number;
  plays: number;
}

type ShapeKind = "circle" | "square" | "triangle";

interface Shape {
  id: string;
  kind: ShapeKind;
  color: string;
}

const KINDS: ShapeKind[] = ["circle", "square", "triangle"];
const COLORS = ["#3B82F6", "#FBBF24", "#F472B6", "#22C55E"];

function makeLevel(level: number): Shape[] {
  const count = Math.min(12, 6 + level * 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `s${i}_${Math.random().toString(16).slice(2)}`,
    kind: KINDS[Math.floor(Math.random() * KINDS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

interface ShapeSorterGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function ShapeSorterGame({ walletCoins, onExit }: ShapeSorterGameProps) {
  const prog = getGameProgress<Progress>("shape_sorter", { bestLevel: 0, plays: 0 });
  const [level, setLevel] = useState(1);
  const [shapes, setShapes] = useState<Shape[]>(() => makeLevel(1));
  const [msg, setMsg] = useState("");

  function drop(kind: ShapeKind) {
    const idx = shapes.findIndex((s) => s.kind === kind);
    if (idx === -1) {
      setMsg("אין יותר כאלה!");
      return;
    }
    const next = shapes.slice();
    next.splice(idx, 1);
    setShapes(next);
    setMsg("✅");

    if (next.length === 0) {
      const nl = level + 1;
      setLevel(nl);
      setShapes(makeLevel(nl));
      setMsg("🎉 עלית שלב!");
      const before = getGameProgress<Progress>("shape_sorter", { bestLevel: 0, plays: 0 });
      setGameProgress("shape_sorter", {
        bestLevel: Math.max(before.bestLevel, nl - 1),
        plays: before.plays,
      });
    }
  }

  function finish() {
    const before = getGameProgress<Progress>("shape_sorter", { bestLevel: 0, plays: 0 });
    setGameProgress("shape_sorter", {
      bestLevel: Math.max(before.bestLevel, level - 1),
      plays: before.plays + 1,
    });
    onExit();
  }

  return (
    <GameFrame
      title="מיין צורות"
      subtitle="לחץ על הבית הנכון כדי לשים צורה במקומה."
      onExit={finish}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          שלב: <b className="ltr">{level}</b>
        </div>
        <div className="badge-kid">
          נשאר: <b className="ltr">{shapes.length}</b>
        </div>
        <div className="pill-kid">
          שיא: <b className="ltr">{prog.bestLevel}</b>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mb-4">
        {shapes.slice(0, 8).map((s) => (
          <div
            key={s.id}
            className="w-14 h-14 rounded-2xl border border-border bg-white/90 flex items-center justify-center"
          >
            <ShapeIcon kind={s.kind} color={s.color} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
        <button className="btn-kid btn-secondary-kid h-20 text-lg" onClick={() => drop("circle")}>
          עיגול
        </button>
        <button className="btn-kid btn-secondary-kid h-20 text-lg" onClick={() => drop("square")}>
          ריבוע
        </button>
        <button className="btn-kid btn-secondary-kid h-20 text-lg" onClick={() => drop("triangle")}>
          משולש
        </button>
      </div>

      {msg && <div className="kid-toast mt-3 justify-center">{msg}</div>}
    </GameFrame>
  );
}

function ShapeIcon({ kind, color }: { kind: ShapeKind; color: string }) {
  if (kind === "circle")
    return <div style={{ width: 26, height: 26, borderRadius: 999, background: color }} />;
  if (kind === "square")
    return <div style={{ width: 26, height: 26, borderRadius: 6, background: color }} />;
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "14px solid transparent",
        borderRight: "14px solid transparent",
        borderBottom: `26px solid ${color}`,
      }}
    />
  );
}
