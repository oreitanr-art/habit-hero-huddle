import { useState } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestLevel: number;
  plays: number;
}

const CELLS = [
  { id: "red", color: "rgba(239,68,68,.45)", label: "אדום" },
  { id: "blue", color: "rgba(59,130,246,.45)", label: "כחול" },
  { id: "yellow", color: "rgba(251,191,36,.45)", label: "צהוב" },
  { id: "green", color: "rgba(34,197,94,.45)", label: "ירוק" },
];

interface PatternSimonGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function PatternSimonGame({ walletCoins, onExit }: PatternSimonGameProps) {
  const prog = getGameProgress<Progress>("pattern_simon", { bestLevel: 0, plays: 0 });
  const [seq, setSeq] = useState<string[]>([]);
  const [input, setInput] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function showSequence(s: string[]) {
    setShowing(true);
    for (const id of s) {
      setFlash(id);
      await new Promise((r) => setTimeout(r, 450));
      setFlash(null);
      await new Promise((r) => setTimeout(r, 200));
    }
    setShowing(false);
  }

  function addStep() {
    const next = [...seq, CELLS[Math.floor(Math.random() * CELLS.length)].id];
    setSeq(next);
    setInput([]);
    setMsg("");
    showSequence(next);
  }

  function start() {
    setSeq([]);
    setInput([]);
    setMsg("");
    setTimeout(() => addStep(), 80);
  }

  function tap(id: string) {
    if (showing || seq.length === 0) return;
    const next = [...input, id];
    setInput(next);
    const idx = next.length - 1;

    if (seq[idx] !== id) {
      setMsg("❌ פספוס… נסה שוב");
      const before = getGameProgress<Progress>("pattern_simon", {
        bestLevel: 0,
        plays: 0,
      });
      const level = Math.max(0, seq.length - 1);
      setGameProgress("pattern_simon", {
        bestLevel: Math.max(before.bestLevel, level),
        plays: before.plays + 1,
      });
      setSeq([]);
      setInput([]);
      return;
    }

    if (next.length === seq.length) {
      setMsg("✅ נכון! עוד שלב");
      setTimeout(() => addStep(), 600);
    }
  }

  const level = Math.max(0, seq.length);

  return (
    <GameFrame
      title="סיימון צבעים"
      subtitle="זכור את הרצף ולחץ לפי הסדר."
      onExit={onExit}
      coins={walletCoins}
    >
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="badge-kid">
          שלב: <b className="ltr">{level}</b>
        </div>
        <div className="pill-kid">
          שיא: <b className="ltr">{prog.bestLevel}</b>
        </div>
      </div>

      {seq.length === 0 ? (
        <button className="btn-kid btn-primary-kid" onClick={start}>
          התחל
        </button>
      ) : (
        <div className="text-muted-foreground opacity-75">המשך לשחק…</div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 max-w-md">
        {CELLS.map((c) => (
          <button
            key={c.id}
            onClick={() => tap(c.id)}
            disabled={showing || seq.length === 0}
            className="h-24 rounded-2xl font-black text-lg transition-all"
            style={{
              background: c.color,
              color: "hsl(var(--ink))",
              border: "1px solid rgba(20,33,61,.12)",
              boxShadow:
                flash === c.id
                  ? "0 0 0 6px rgba(255,255,255,.35)"
                  : "var(--shadow-1)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {msg && <div className="kid-toast mt-3">{msg}</div>}
    </GameFrame>
  );
}
