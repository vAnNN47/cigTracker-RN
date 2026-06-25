import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const emptySubscribe = () => () => {};

/**
 * Web color scheme. To support static rendering, the value is resolved through
 * useSyncExternalStore: the server snapshot is always 'light' (so server HTML and
 * the first client paint match), then it switches to the real device scheme after
 * hydration.
 */
export function useColorScheme() {
  const scheme = useRNColorScheme();
  return useSyncExternalStore(
    emptySubscribe,
    () => scheme,
    () => 'light' as const,
  );
}
