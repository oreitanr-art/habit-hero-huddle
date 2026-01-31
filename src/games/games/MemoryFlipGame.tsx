import { useState, useEffect } from "react";
import { GameFrame } from "../GameFrame";
import { getGameProgress, setGameProgress } from "../storage";

interface Progress {
  bestMoves: number | null;
  plays: number;
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOJIS = ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐸", "🦁"];

function shuffleCards(): Card[] {
  const pairs = EMOJIS.flatMap((emoji, i) => [
    { id: i * 2, emoji, flipped: false, matched: false },
    { id: i * 2 + 1, emoji, flipped: false, matched: false },
  ]);
  return pairs.sort(() => Math.random() - 0.5);
}

interface MemoryFlipGameProps {
  walletCoins: number;
  onExit: () => void;
}

export function MemoryFlipGame({ walletCoins, onExit }: MemoryFlipGameProps) {
  const prog = getGameProgress<Progress>("memory_flip", { bestMoves: null, plays: 0 });
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(false);

  function reset() {
    setCards(shuffleCards());
    setFlippedIds([]);
    setMoves(0);
    setDone(false);
    setChecking(false);
  }

  function handleClick(id: number) {
    if (checking || done) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched || card.flipped) return;

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setChecking(true);

      const [first, second] = newFlipped;
      const c1 = cards.find((c) => c.id === first)!;
      const c2 = cards.find((c) => c.id === second)!;

      setTimeout(() => {
        if (c1.emoji === c2.emoji) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, matched: true } : c
            )
          );
        } else {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, flipped: false } : c
            )
          );
        }
        setFlippedIds([]);
        setChecking(false);
      }, 800);
    }
  }

  useEffect(() => {
    if (cards.every((c) => c.matched) && cards.length > 0) {
      setDone(true);
      const before = getGameProgress<Progress>("memory_flip", {
        bestMoves: null,
        plays: 0,
      });
      const best =
        before.bestMoves == null ? moves : Math.min(before.bestMoves, moves);
      setGameProgress("memory_flip", {
        bestMoves: best,
        plays: before.plays + 1,
      });
    }
  }, [cards, moves]);

  return (
    <GameFrame
      title="זיכרון קלפים"
      subtitle="מצא את כל הזוגות."
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
          חדש
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-md">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            disabled={card.matched || card.flipped}
            className="h-20 rounded-xl text-3xl font-bold transition-all duration-200"
            style={{
              background:
                card.flipped || card.matched
                  ? card.matched
                    ? "rgba(34,197,94,.15)"
                    : "rgba(59,130,246,.12)"
                  : "linear-gradient(180deg, hsl(var(--secondary)), #F59E0B)",
              border:
                card.matched
                  ? "2px solid rgba(34,197,94,.4)"
                  : "1px solid rgba(20,33,61,.12)",
            }}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>

      {done && (
        <div className="kid-toast mt-3">
          ✅ סיימת! מהלכים: <b>{moves}</b>
        </div>
      )}
    </GameFrame>
  );
}
