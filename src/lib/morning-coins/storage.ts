import { Store } from "./types";
import { DEFAULT_STORE } from "./defaults";

const STORAGE_KEY = "morningCoins_v1";

export function loadStore(): Store {
  if (typeof window === "undefined") return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;
    const parsed = JSON.parse(raw) as Partial<Store>;
    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_STORE,
      ...parsed,
      settings: {
        ...DEFAULT_STORE.settings,
        ...parsed.settings,
        bonuses: {
          ...DEFAULT_STORE.settings.bonuses,
          ...parsed.settings?.bonuses,
        },
        penalties: {
          ...DEFAULT_STORE.settings.penalties,
          ...parsed.settings?.penalties,
        },
      },
      streak: {
        ...DEFAULT_STORE.streak,
        ...parsed.streak,
      },
    };
  } catch {
    return DEFAULT_STORE;
  }
}

export function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function resetStore(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE));
}
