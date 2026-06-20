/**
 * Add a purchase — pack/carton + quantity + total price. Numeric entry uses the
 * in-app number pad (packages/number-pad), unit uses a small segmented control.
 * Saves via store.addPurchase, stamped "now". Feeds the Diary purchase history.
 *
 * Imperative API: parent calls ref.present().
 */
import { MaterialIcons } from "@expo/vector-icons";
import { randomUUID } from "expo-crypto";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useToast } from "@/components/Toast";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { cigsInPurchase, PACKS_PER_CARTON, PackUnit, Purchase } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing, type } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef } from "../../packages/keyboard-sheet";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

export interface AddPurchaseSheetRef {
  // Pass an existing purchase to edit it; omit to add a new one.
  present: (purchase?: Purchase) => void;
}

export const AddPurchaseSheet = forwardRef<AddPurchaseSheetRef, object>(
  function AddPurchaseSheet(_props, ref) {
    const s = useStrings();
    const toast = useToast();
    const addPurchase = useAppStore((st) => st.addPurchase);
    const editPurchase = useAppStore((st) => st.editPurchase);
    const deletePurchase = useAppStore((st) => st.deletePurchase);
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
    // The purchase being edited (null = adding a new one).
    const [editing, setEditing] = useState<Purchase | null>(null);

    // Suggested total from the known per-pack price (×10 for a carton).
    const derivedPrice = (u: PackUnit, q: number) =>
      pricePerPack * (u === "carton" ? PACKS_PER_CARTON : 1) * q;

    useImperativeHandle(ref, () => ({
      present: (purchase) => {
        if (purchase) {
          setUnit(purchase.unit);
          setQuantity(purchase.quantity);
          setPrice(purchase.price);
          setPriceEdited(true); // keep the saved price; don't auto-derive over it
          setEditing(purchase);
        } else {
          setUnit("pack");
          setQuantity(1);
          setPrice(derivedPrice("pack", 1));
          setPriceEdited(false);
          setEditing(null);
        }
        setSaving(false);
        sheetRef.current?.present();
      },
    }));

    const money = (n: number) => `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
    const cigs = cigsInPurchase({ id: "", unit, quantity, price, boughtAt: new Date() });

    const save = async () => {
      setSaving(true);
      if (editing) {
        await editPurchase(editing.id, { unit, quantity, price });
      } else {
        await addPurchase({ id: randomUUID(), unit, quantity, price, boughtAt: new Date() });
      }
      setSaving(false);
      sheetRef.current?.dismiss();
      toast.show({ message: s.savedToast });
    };

    const remove = () => {
      if (!editing) return;
      Alert.alert(s.deletePurchaseTitle, s.deletePurchaseBody, [
        { text: s.cancel, style: "cancel" },
        {
          text: s.delete,
          style: "destructive",
          onPress: async () => {
            await deletePurchase(editing.id);
            sheetRef.current?.dismiss();
            toast.show({ message: s.purchaseDeletedToast });
          },
        },
      ]);
    };

    return (
      <KeyboardSheet
        ref={sheetRef}
        dismissMode="swipe"
        backgroundColor={colors.surface}
        handleColor={colors.line}
        cornerRadius={radius.sheet}
      >
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{editing ? s.editPurchase : s.addPurchase}</Text>
            {editing && (
              <Pressable onPress={remove} hitSlop={8} style={styles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={22} color={colors.bad} />
              </Pressable>
            )}
          </View>

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
        </View>

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
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
  deleteBtn: { padding: 2 },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.fill,
    borderRadius: radius.chip,
    padding: 4,
  },
  segBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.chip - 2 },
  segBtnSel: { backgroundColor: colors.accent },
  segText: { color: colors.textDim, fontFamily: fonts.bold },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: { color: colors.textDim, fontSize: type.body.fontSize, fontFamily: fonts.regular, textAlign: textStart },
  rowValue: { color: colors.text, fontSize: 18, fontFamily: fonts.monoMedium },
  hint: { color: colors.textDim, fontSize: 13, fontFamily: fonts.regular, marginLeft: spacing.xs, textAlign: textStart },
  button: {
    marginTop: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: type.body.fontSize },
});
