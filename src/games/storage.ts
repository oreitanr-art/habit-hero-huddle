// Game progress storage utilities (localStorage-based for now)
import { GameId, GameState } from "./types";

const STORAGE_KEY = "morning-coins-games";

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Error loading game state:", e);
  }
  return { dailyOffers: {}, progress: {} as any };
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Error saving game state:", e);
  }
}

export function getGameProgress<T>(gameId: GameId, defaultValue: T): T {
  const state = loadGameState();
  return (state.progress[gameId] as T) ?? defaultValue;
}

export function setGameProgress<T>(gameId: GameId, progress: T): void {
  const state = loadGameState();
  state.progress[gameId] = progress;
  saveGameState(state);
}

export function getDailyOffers(dateISO: string): GameId[] | null {
  const state = loadGameState();
  return state.dailyOffers[dateISO] ?? null;
}

export function saveDailyOffers(dateISO: string, offers: GameId[]): void {
  const state = loadGameState();
  state.dailyOffers[dateISO] = offers;
  saveGameState(state);
}
