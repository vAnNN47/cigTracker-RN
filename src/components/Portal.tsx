/**
 * Tiny in-tree portal (no dependencies). Lets a component render its UI at the
 * app ROOT — above the tabs — while staying inside the React tree (so it's under
 * KeyboardProvider, unlike an RN <Modal> which is a separate window where
 * react-native-keyboard-controller can't track the keyboard).
 *
 * Uses an external store so pushing content only re-renders <PortalHost/>, never
 * the whole app (no render loop).
 */
import { ReactNode, useEffect, useId, useSyncExternalStore } from "react";
import { StyleSheet, View } from "react-native";

let registry: Record<string, ReactNode> = {};
const listeners = new Set<() => void>();

const store = {
  set(id: string, node: ReactNode) {
    registry = { ...registry, [id]: node };
    listeners.forEach((l) => l());
  },
  remove(id: string) {
    const next = { ...registry };
    delete next[id];
    registry = next;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  snapshot: () => registry,
};

/** Render once at the app root, after the navigator. */
export function PortalHost() {
  const reg = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
  const ids = Object.keys(reg);
  if (ids.length === 0) return null;
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {ids.map((id) => (
        <View key={id} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {reg[id]}
        </View>
      ))}
    </View>
  );
}

/** Teleports its children to <PortalHost/>. */
export function Portal({ children }: { children: ReactNode }) {
  const id = useId();
  useEffect(() => {
    store.set(id, children);
    return () => store.remove(id);
  });
  return null;
}
