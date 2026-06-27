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
import { ActivityIndicator, Alert } from "react-native";

import { useToast } from "@/components/feedback/Toast";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { cigsInPurchase, PACKS_PER_CARTON, PackUnit, Purchase } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { radius, useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

import { KeyboardSheet, KeyboardSheetRef } from "../../../packages/keyboard-sheet";
import { NumberPad, NumberPadRef } from "../../../packages/number-pad";

export interface AddPurchaseSheetRef {
  // Pass an existing purchase to edit it; omit to add a new one.
  present: (purchase?: Purchase) => void;
}

/** Add/edit a purchase bottom sheet; opened imperatively via ref.present(). */
export const AddPurchaseSheet = forwardRef<AddPurchaseSheetRef, object>(
  function AddPurchaseSheet(_props, ref) {
    const s = useStrings();
    const green = useColors();
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
        <View className="p-3 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-text text-[20px] font-bold" style={{ textAlign: textStart }}>
              {editing ? s.editPurchase : s.addPurchase}
            </Text>
            {editing && (
              <Pressable onPress={remove} hitSlop={8} className="p-0.5">
                <MaterialIcons name="delete-outline" size={22} color={green.error} />
              </Pressable>
            )}
          </View>

          {/* Unit segmented control */}
          <View className="flex-row gap-2 bg-card-soft rounded-chip p-1">
            {(["pack", "carton"] as PackUnit[]).map((u) => {
              const sel = unit === u;
              return (
                <Pressable
                  key={u}
                  onPress={() => {
                    setUnit(u);
                    if (!priceEdited) setPrice(derivedPrice(u, quantity));
                  }}
                  className={`flex-1 items-center py-2.5 rounded-[10px]${sel ? " bg-green" : ""}`}
                >
                  <Text className={`${sel ? "text-on-green" : "text-text-dim"} font-bold`}>
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

          <Text className="text-text-dim text-[13px] font-regular ml-1" style={{ textAlign: textStart }}>
            {s.cigsInThis(cigs)}
          </Text>

          <Pressable
            className={`mt-1 bg-green rounded-button py-3 items-center${saving ? " opacity-60" : ""}`}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={green.onGreen} />
            ) : (
              <Text className="text-on-green font-bold text-[14px]">{s.save}</Text>
            )}
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
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-card-soft rounded-input px-3 py-2"
    >
      <Text className="text-text-dim text-[14px] font-regular" style={{ textAlign: textStart }}>{label}</Text>
      <Text className="text-text text-[18px] font-mono-medium">{value}</Text>
    </Pressable>
  );
}
