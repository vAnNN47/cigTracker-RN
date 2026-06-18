/**
 * Add a purchase — pack/carton + quantity + total price. Numeric entry uses the
 * in-app number pad (packages/number-pad), unit uses a small segmented control.
 * Saves via store.addPurchase, stamped "now". Feeds the Diary purchase history.
 *
 * Imperative API: parent calls ref.present().
 */
import { randomUUID } from "expo-crypto";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useToast } from "@/components/Toast";
import { useStrings } from "@/i18n/useStrings";
import { cigsInPurchase, PACKS_PER_CARTON, PackUnit, Purchase } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef } from "../../packages/keyboard-sheet";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

export interface AddPurchaseSheetRef {
  present: () => void;
}

export const AddPurchaseSheet = forwardRef<AddPurchaseSheetRef, object>(
  function AddPurchaseSheet(_props, ref) {
    const s = useStrings();
    const toast = useToast();
    const addPurchase = useAppStore((st) => st.addPurchase);
    const settings = useAppStore((st) => st.settings);
    const cur = settings.currencySymbol;
    const pricePerPack = settings.pricePerPack;
    const sheetRef = useRef<KeyboardSheetRef>(null);
    const pad = useRef<NumberPadRef>(null);

    const [unit, setUnit] = useState<PackUnit>("pack");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(pricePerPack);
    const [priceEdited, setPriceEdited] = useState(false);
    const [saving, setSaving] = useState(false);

    // Suggested total from the known per-pack price (×10 for a carton).
    const derivedPrice = (u: PackUnit, q: number) =>
      pricePerPack * (u === "carton" ? PACKS_PER_CARTON : 1) * q;

    useImperativeHandle(ref, () => ({
      present: () => {
        setUnit("pack");
        setQuantity(1);
        setPrice(derivedPrice("pack", 1));
        setPriceEdited(false);
        setSaving(false);
        sheetRef.current?.present();
      },
    }));

    const money = (n: number) => `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
    const cigs = cigsInPurchase({ id: "", unit, quantity, price, boughtAt: new Date() });

    const save = async () => {
      setSaving(true);
      const purchase: Purchase = {
        id: randomUUID(),
        unit,
        quantity,
        price,
        boughtAt: new Date(),
      };
      await addPurchase(purchase);
      setSaving(false);
      sheetRef.current?.dismiss();
      toast.show({ message: s.savedToast });
    };

    return (
      <KeyboardSheet
        ref={sheetRef}
        dismissMode="swipe"
        backgroundColor={colors.surface}
        handleColor={colors.line}
        cornerRadius={radius.sheet}
      >
        <Text style={styles.title}>{s.addPurchase}</Text>

        {/* Unit segmented control */}
        <View style={styles.segment}>
          {(["pack", "carton"] as PackUnit[]).map((u) => {
            const sel = unit === u;
            return (
              <Pressable
                key={u}
                onPress={() => {
                  setUnit(u);
                  if (!priceEdited) setPrice(derivedPrice(u, quantity));
                }}
                style={[styles.segBtn, sel && styles.segBtnSel]}
              >
                <Text style={[styles.segText, sel && { color: colors.onAccent }]}>
                  {u === "carton" ? s.carton : s.pack}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Quantity */}
        <EditRow
          label={s.quantity}
          value={`${quantity}`}
          onPress={() =>
            pad.current?.present({
              title: s.quantity,
              initial: quantity,
              onSubmit: (v) => {
                const q = Math.max(1, Math.round(v));
                setQuantity(q);
                if (!priceEdited) setPrice(derivedPrice(unit, q));
              },
            })
          }
        />
        {/* Total price */}
        <EditRow
          label={s.totalPrice}
          value={money(price)}
          onPress={() =>
            pad.current?.present({
              title: s.totalPrice,
              initial: price,
              decimal: true,
              prefix: `${cur} `,
              onSubmit: (v) => {
                setPrice(v);
                setPriceEdited(true);
              },
            })
          }
        />

        <Text style={styles.hint}>{s.cigsInThis(cigs)}</Text>

        <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={save} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? "…" : s.save}</Text>
        </Pressable>

        <NumberPad
          ref={pad}
          surface={colors.surface}
          surfaceHigh={colors.surfaceHigh}
          text={colors.text}
          textDim={colors.textDim}
          accent={colors.accent}
          onAccent={colors.onAccent}
          cornerRadius={radius.sheet}
          cancelLabel={s.cancel}
          saveLabel={s.save}
        />
      </KeyboardSheet>
    );
  },
);

function EditRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.fill,
    borderRadius: radius.chip,
    padding: 4,
    marginTop: spacing.md,
  },
  segBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.chip - 2 },
  segBtnSel: { backgroundColor: colors.accent },
  segText: { color: colors.textDim, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  rowLabel: { color: colors.textDim, fontSize: type.body.fontSize },
  rowValue: { color: colors.text, fontSize: 18, fontWeight: "700" },
  hint: { color: colors.textDim, fontSize: 13, marginTop: spacing.sm, marginLeft: spacing.xs },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onAccent, fontWeight: "700", fontSize: type.body.fontSize },
});
