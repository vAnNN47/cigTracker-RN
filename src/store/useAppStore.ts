/**
 * The app-wide Zustand store — the React Native equivalent of the Flutter
 * AppState (ChangeNotifier + Provider). It holds the raw data and the write
 * actions; all *derived* values (counts, limits, savings) come from the pure
 * functions in src/domain/logic.ts so the store stays thin.
 *
 * Usage in a component:
 *   const logs = useAppStore((s) => s.logs);        // re-renders only on logs change
 *   const addSmoke = useAppStore((s) => s.addSmoke);
 */
import { create } from "zustand";

import { createRepository } from "@/data/createRepository";
import { Repository } from "@/data/repository";
import { logicalToday } from "@/domain/logic";
import { AppSettings, DailyLimit, DEFAULT_SETTINGS, Purchase, SmokeLog } from "@/models";

interface AppStore {
  // raw state
  repo: Repository;
  loading: boolean;
  logs: SmokeLog[];
  limits: DailyLimit[];
  purchases: Purchase[];
  settings: AppSettings;

  // actions
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  addSmoke: (comment?: string, diary?: string) => Promise<SmokeLog>;
  editLog: (id: string, args: { comment?: string; diary?: string }) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  addPurchase: (purchase: Purchase) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  repo: createRepository(),
  loading: true,
  logs: [],
  limits: [],
  purchases: [],
  settings: { ...DEFAULT_SETTINGS },

  load: async () => {
    set({ loading: true });
    await fetchAll(get, set);
    set({ loading: false });
  },

  refresh: async () => {
    await fetchAll(get, set);
  },

  addSmoke: async (comment = "", diary = "") => {
    const log = await get().repo.addLog({ comment, diary });
    set({ logs: await get().repo.getLogs() });
    return log;
  },

  editLog: async (id, { comment, diary }) => {
    await get().repo.updateLog(id, { comment, diary });
    set({ logs: await get().repo.getLogs() });
  },

  deleteLog: async (id) => {
    await get().repo.deleteLog(id);
    set({ logs: await get().repo.getLogs() });
  },

  setLimit: async (limit) => {
    const { repo, settings } = get();
    await repo.setLimit(limit, logicalToday(settings.dayStartHour));
    set({ limits: await repo.getLimits() });
  },

  addPurchase: async (purchase) => {
    await get().repo.addPurchase(purchase);
    set({ purchases: await get().repo.getPurchases() });
  },

  saveSettings: async (settings) => {
    const saved = await get().repo.saveSettings(settings);
    set({ settings: saved });
  },
}));

async function fetchAll(
  get: () => AppStore,
  set: (partial: Partial<AppStore>) => void,
) {
  const { repo } = get();
  const [logs, limits, purchases, settings] = await Promise.all([
    repo.getLogs(),
    repo.getLimits(),
    repo.getPurchases(),
    repo.getSettings(),
  ]);
  set({ logs, limits, purchases, settings });
}
