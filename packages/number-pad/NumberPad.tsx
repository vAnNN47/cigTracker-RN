/**
 * In-app numeric keypad as a bottom sheet (no OS keyboard).
 * Behaves identically on every platform.
 *
 * Imperative API: keep one <NumberPad ref={ref} /> mounted, then call
 *   ref.current?.present({ title, initial, decimal, prefix, onSubmit });
 * onSubmit(value) fires on Save. Theme via props.
 */
import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface NumberPadOptions {
  title: string;
  initial: number;
  decimal?: boolean;
  prefix?: string;
  onSubmit: (value: number) => void;
}

export interface NumberPadRef {
  present: (opts: NumberPadOptions) => void;
  dismiss: () => void;
}

interface NumberPadProps {
  surface?: string;
  surfaceHigh?: string;
  text?: string;
  textDim?: string;
  accent?: string;
  onAccent?: string;
  backdropColor?: string;
  backdropOpacity?: number;
  cornerRadius?: number;
  cancelLabel?: string;
  saveLabel?: string;
}

function fmt(n: number, decimal?: boolean) {
  if (decimal) return Number.isInteger(n) ? String(n) : String(n);
  return String(Math.trunc(n));
}

export const NumberPad = forwardRef<NumberPadRef, NumberPadProps>(function NumberPad(
  {
    surface = "#1b1b1f",
    surfaceHigh = "#26262b",
    text = "#ffffff",
    textDim = "#9aa0aa",
    accent = "#4caf50",
    onAccent = "#000000",
    backdropColor = "#000000",
    backdropOpacity = 0.5,
    cornerRadius = 24,
    cancelLabel = "Cancel",
    saveLabel = "Save",
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const [opts, setOpts] = useState<NumberPadOptions | null>(null);
  const [val, setVal] = useState("0");
  const [fresh, setFresh] = useState(true);

  useImperativeHandle(ref, () => ({
    present: (o) => {
      setOpts(o);
      setVal(fmt(o.initial, o.decimal));
      setFresh(true);
    },
    dismiss: () => setOpts(null),
  }));

  const decimal = opts?.decimal ?? false;

  const tap = (k: string) => {
    setVal((cur) => {
      if (k === "back") return fresh ? "0" : cur.length > 1 ? cur.slice(0, -1) : "0";
      if (k === ".") {
        if (fresh) return "0.";
        return cur.includes(".") ? cur : cur + ".";
      }
      if (fresh || cur === "0") return k;
      return cur.length < 7 ? cur + k : cur;
    });
    setFresh(false);
  };

  const parsed = () => (decimal ? parseFloat(val) || 0 : parseInt(val, 10) || 0);
  const submit = () => {
    opts?.onSubmit(parsed());
    setOpts(null);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", decimal ? "." : "", "0", "back"];

  return (
    <Modal visible={opts !== null} transparent animationType="slide" onRequestClose={() => setOpts(null)}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, opacity: backdropOpacity }]}
        onPress={() => setOpts(null)}
      />
      <View
        style={[
          styles.sheet,
          { backgroundColor: surface, borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Text style={[styles.title, { color: text }]}>{opts?.title}</Text>
        <View style={[styles.display, { backgroundColor: surfaceHigh }]}>
          <Text style={[styles.displayText, { color: text }]}>{(opts?.prefix ?? "") + val}</Text>
        </View>
        <View style={styles.grid}>
          {keys.map((k, i) =>
            k === "" ? (
              <View key={i} style={styles.cell} />
            ) : (
              <Pressable key={i} style={[styles.cell, styles.key, { backgroundColor: surfaceHigh }]} onPress={() => tap(k)}>
                <Text style={[styles.keyText, { color: text }]}>{k === "back" ? "⌫" : k}</Text>
              </Pressable>
            ),
          )}
        </View>
        <View style={styles.actions}>
          <Pressable style={[styles.cancel, { backgroundColor: surfaceHigh }]} onPress={() => setOpts(null)}>
            <Text style={[styles.cancelText, { color: textDim }]}>{cancelLabel}</Text>
          </Pressable>
          <Pressable style={[styles.save, { backgroundColor: accent }]} onPress={submit}>
            <Text style={[styles.saveText, { color: onAccent }]}>{saveLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 18 },
  title: { fontSize: 16, fontWeight: "600" },
  display: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, marginTop: 12 },
  displayText: { fontSize: 30, fontWeight: "700", writingDirection: "ltr" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 14 },
  cell: { width: "31%", height: 54, marginBottom: 10 },
  key: { borderRadius: 14, alignItems: "center", justifyContent: "center" },
  keyText: { fontSize: 22, fontWeight: "600" },
  // Two balanced buttons with breathing room (no longer pinned to the edges).
  actions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  cancel: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 14 },
  cancelText: { fontSize: 16, fontWeight: "600" },
  save: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 14 },
  saveText: { fontSize: 16, fontWeight: "600" },
});
