/**
 * Which slide-in drawer is open. Rendered once at the app root; any screen can
 * open one via show("main" | "account").
 */
import { create } from "zustand";

type DrawerKind = "main" | "account" | null;

interface DrawerState {
  open: DrawerKind;
  show: (kind: Exclude<DrawerKind, null>) => void;
  hide: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  open: null,
  show: (kind) => set({ open: kind }),
  hide: () => set({ open: null }),
}));
