/**
 * Clipboard helper that loads `expo-clipboard` lazily. The native module is only
 * touched when copy is actually invoked (not at import), so a dev build that
 * predates the dependency degrades gracefully — copy no-ops instead of crashing
 * the whole app at module load. Returns true when the text was copied.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}
