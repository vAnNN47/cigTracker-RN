/**
 * Add a purchase — pack/carton + quantity + total price. Numeric entry uses the
 * in-app number pad (packages/number-pad), unit uses a small segmented control.
 * Saves via store.addPurchase, stamped "now". Feeds the Diary purchase history.
 *
 * Imperative API: parent calls ref.present().
 */
import { MaterialIcons } from "@expo/vector-icons";
import { randomUUID } from "expo-crypto";
import * as Haptics from "expo-haptics";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useToast } from "@/components/Toast";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { cigsInPurchase, PACKS_PER_CARTON, PackUnit, Purchase } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, radius, spacing, type, useColors } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef } from "../../packages/keyboard-sheet";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

const BAD = "#C0392B";

export interface AddPurchaseSheetRef {
  // Pass an existing purchase to edit it; omit to add a new one.
  present: (purchase?: Purchase) => void;
}

export const AddPurchaseSheet = forwardRef<AddPurchaseSheetRef, object>(
  function AddPurchaseSheet(_props, ref) {
    const s = useStrings();
    const green = useColors();
    const styles = useStyles();
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
      try {
        if (editing) {
          await editPurchase(editing.id, { unit, quantity, price });
        } else {
          await addPurchase({ id: randomUUID(), unit, quantity, price, boughtAt: new Date() });
        }
        // Match the add-cigarette flow: success haptic, dismiss, then toast.
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        sheetRef.current?.dismiss();
        toast.show({ message: s.savedToast });
      } catch (e) {
        Alert.alert(`${s.couldNotSave}: ${e}`);
        setSaving(false);
      }
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
        backgroundColor={green.bg}
        handleColor={green.border}
        cornerRadius={radius.sheet}
      >
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{editing ? s.editPurchase : s.addPurchase}</Text>
            {editing && (
              <Pressable onPress={remove} hitSlop={8} style={styles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={22} color={BAD} />
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
                  <Text style={[styles.segText, sel && { color: green.onGreen }]}>
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
            {saving ? <ActivityIndicator color={green.onGreen} /> : <Text style={styles.buttonText}>{s.save}</Text>}
          </Pressable>
        </View>

        <NumberPad
          ref={pad}
          surface={green.card}
          surfaceHigh={green.cardSoft}
          text={green.text}
          textDim={green.textDim}
          accent={green.green}
          onAccent={green.onGreen}
          cornerRadius={radius.sheet}
          cancelLabel={s.cancel}
          saveLabel={s.save}
        />
      </KeyboardSheet>
    );
  },
);

function EditRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Pressable>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: green.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
  deleteBtn: { padding: 2 },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: green.cardSoft,
    borderRadius: radius.chip,
    padding: 4,
  },
  segBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.chip - 2 },
  segBtnSel: { backgroundColor: green.green },
  segText: { color: green.textDim, fontFamily: fonts.bold },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: green.cardSoft,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: { color: green.textDim, fontSize: type.body.fontSize, fontFamily: fonts.regular, textAlign: textStart },
  rowValue: { color: green.text, fontSize: 18, fontFamily: fonts.monoMedium },
  hint: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginLeft: spacing.xs, textAlign: textStart },
  button: {
    marginTop: spacing.xs,
    backgroundColor: green.green,
    borderRadius: radius.button,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: green.onGreen, fontFamily: fonts.bold, fontSize: type.body.fontSize },
  }),
);
