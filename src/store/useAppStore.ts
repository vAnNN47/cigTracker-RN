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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { createRepository, DataMode } from "@/data/createRepository";
import { Repository } from "@/data/repository";
import { logicalToday } from "@/domain/logic";
import { applyDirection, reloadForDirection } from "@/i18n/rtl";
import { AppSettings, DailyLimit, DEFAULT_SETTINGS, Purchase, SmokeLog } from "@/models";

const LOCALE_KEY = "cigtracker.locale";
const MODE_KEY = "cigtracker.dataMode";

interface AppStore {
  // raw state
  repo: Repository;
  dataMode: DataMode | null; // null = not chosen yet (welcome screen)
  loading: boolean;
  logs: SmokeLog[];
  limits: DailyLimit[];
  purchases: Purchase[];
  settings: AppSettings;
  locale: "device" | "en" | "he"; // UI language override (RTL handling: Step 7)

  // actions
  setDataMode: (mode: DataMode | null) => Promise<void>;
  hydrateDataMode: () => Promise<void>;
  setLocale: (locale: "device" | "en" | "he") => void;
  hydrateLocale: () => Promise<void>;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  addSmoke: (comment?: string, diary?: string, smokedAt?: Date) => Promise<SmokeLog>;
  editLog: (id: string, args: { comment?: string; diary?: string; smokedAt?: Date }) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  addPurchase: (purchase: Purchase) => Promise<void>;
  editPurchase: (
    id: string,
    args: { unit?: Purchase["unit"]; quantity?: number; price?: number; boughtAt?: Date },
  ) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  repo: createRepository(null),
  dataMode: null,
  loading: true,
  logs: [],
  limits: [],
  purchases: [],
  settings: { ...DEFAULT_SETTINGS },
  locale: "device",

  // Choose (or clear) the data backend. Persists the choice and swaps the repo.
  // Pass null to "forget" the choice and return to the welcome screen.
  setDataMode: async (mode) => {
    if (mode) await AsyncStorage.setItem(MODE_KEY, mode).catch(() => {});
    else await AsyncStorage.removeItem(MODE_KEY).catch(() => {});
    set({ dataMode: mode, repo: createRepository(mode) });
  },

  // Read the saved data mode on boot and build the matching repo.
  hydrateDataMode: async () => {
    const saved = (await AsyncStorage.getItem(MODE_KEY)) as DataMode | null;
    if (saved === "local" || saved === "supabase") {
      set({ dataMode: saved, repo: createRepository(saved) });
    }
  },

  setLocale: (locale) => {
    set({ locale });
    AsyncStorage.setItem(LOCALE_KEY, locale).catch(() => {});
    // Flip layout direction (LTR↔RTL); reload only if it actually changed.
    if (applyDirection(locale)) reloadForDirection();
  },

  // Read the saved locale on boot and align the layout direction with it.
  hydrateLocale: async () => {
    const saved = (await AsyncStorage.getItem(LOCALE_KEY)) as
      | "device"
      | "en"
      | "he"
      | null;
    const locale = saved ?? "device";
    if (saved) set({ locale });
    if (applyDirection(locale)) reloadForDirection();
  },

  load: async () => {
    set({ loading: true });
    await fetchAll(get, set);
    set({ loading: false });
  },

  refresh: async () => {
    await fetchAll(get, set);
  },

  addSmoke: async (comment = "", diary = "", smokedAt) => {
    const log = await get().repo.addLog({ comment, diary, smokedAt });
    set({ logs: await get().repo.getLogs() });
    return log;
  },

  editLog: async (id, { comment, diary, smokedAt }) => {
    await get().repo.updateLog(id, { comment, diary, smokedAt });
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

  editPurchase: async (id, args) => {
    await get().repo.updatePurchase(id, args);
    set({ purchases: await get().repo.getPurchases() });
  },

  deletePurchase: async (id) => {
    await get().repo.deletePurchase(id);
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
