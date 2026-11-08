import { createInitialDB, type Mutation } from "./db";
import type { DB } from "./types";

/**
 * مستودع البيانات: واجهة موحدة تعتمد عليها كل التطبيقات.
 * - LocalRepository: للعرض والتجربة (التخزين في المتصفح، ومزامنة لحظية بين التطبيقات المفتوحة).
 * - لاحقاً: SupabaseRepository أو API خاص بنفس الواجهة، بدون تغيير أي شاشة.
 */
export interface Repository {
  get(): DB;
  apply(m: Mutation): void;
  subscribe(listener: () => void): () => void;
  reset(): void;
}

const KEY = "munasabati.db.v2";

export function createLocalRepository(key = KEY): Repository {
  const listeners = new Set<() => void>();
  let state: DB = read() ?? createInitialDB();

  function read(): DB | null {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as DB) : null;
      return parsed?.version === 2 ? parsed : null;
    } catch {
      return null;
    }
  }
  function write() {
    try { globalThis.localStorage?.setItem(key, JSON.stringify(state)); } catch { /* التخزين غير متاح */ }
  }
  const emit = () => listeners.forEach((l) => l());

  // مزامنة بين التطبيقات: طلب من تطبيق العميل يظهر فوراً في بوابة المورد المفتوحة
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key !== key) return;
      const next = read();
      if (next) { state = next; emit(); }
    });
  }

  return {
    get: () => state,
    apply(m) { state = m(state); write(); emit(); },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    reset() { state = createInitialDB(); write(); emit(); },
  };
}

export function createMemoryRepository(initial: DB = createInitialDB()): Repository {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    apply(m) { state = m(state); listeners.forEach((l) => l()); },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    reset() { state = createInitialDB(); listeners.forEach((l) => l()); },
  };
}
