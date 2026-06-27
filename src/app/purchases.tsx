/**
 * Purchases history — opened from Today's "Recent Purchase → View History".
 * Lists every purchase grouped by day (newest first) with a per-day total and a
 * grand total at the top. Read-only.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { I18nManager, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/sheets/AddPurchaseSheet";
import { dayKey, keyOf } from "@/domain/day";
import { formatTime, formatWeekdayDate } from "@/i18n/format";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { Purchase } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

interface DayGroup {
  key: string;
  date: Date;
  total: number;
  data: Purchase[]; // SectionList reads each section's rows from `data`
}

/** Read-only purchase history grouped by day, with per-day and grand totals. */
export default function PurchasesScreen() {
  const s = useStrings();
  const green = useColors();
  const router = useRouter();
  const { purchases, settings } = useAppStore(
    useShallow((st) => ({ purchases: st.purchases, settings: st.settings })),
  );
  const purchaseRef = useRef<AddPurchaseSheetRef>(null);

  const cur = settings.currencySymbol;
  const money = (n: number) => `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";

  const { groups, grandTotal } = useMemo(() => {
    const sorted = [...purchases].sort((a, b) => b.boughtAt.getTime() - a.boughtAt.getTime());
    const map = new Map<string, DayGroup>();
    const out: DayGroup[] = [];
    for (const p of sorted) {
      const k = dayKey(p.boughtAt);
      let g = map.get(k);
      if (!g) {
        g = { key: k, date: keyOf(p.boughtAt), total: 0, data: [] };
        map.set(k, g);
        out.push(g);
      }
      g.data.push(p);
      g.total += p.price;
    }
    return { groups: out, grandTotal: sorted.reduce((a, p) => a + p.price, 0) };
  }, [purchases]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="w-8 h-8 items-center justify-center">
          <MaterialIcons name={backIcon} size={26} color={green.text} />
        </Pressable>
        <Text className="text-text text-[20px] font-bold" style={{ textAlign: textStart }}>{s.purchaseHistory}</Text>
      </View>

      <SectionList
        sections={groups}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        alwaysBounceVertical
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text className="text-text-dim font-regular py-6 text-center">{s.noPurchasesYet}</Text>
        }
        ListHeaderComponent={
          groups.length > 0 ? (
            <View className="bg-card rounded-card border border-border px-4 py-4 mt-2">
              <Text className="text-text-dim text-[13px] font-regular" style={{ textAlign: textStart }}>
                {s.totalSpentLabel}
              </Text>
              <Text className="text-text text-[28px] font-mono-semibold mt-0.5" style={{ textAlign: textStart }}>
                {money(grandTotal)}
              </Text>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center justify-between mt-4 mb-1">
            <Text className="text-text text-[15px] font-bold" style={{ textAlign: textStart }}>
              {formatWeekdayDate(section.date, s.localeCode)}
            </Text>
            <Text className="text-text-dim text-[14px] font-mono-medium">{money(section.total)}</Text>
          </View>
        )}
        renderItem={({ item: p }) => (
          <Pressable
            className="flex-row items-center gap-3 border-b border-border py-3"
            onPress={() => purchaseRef.current?.present(p)}
          >
            <View className="w-9 h-9 rounded-[18px] bg-card-soft items-center justify-center">
              <MaterialIcons
                name={p.unit === "carton" ? "inventory-2" : "receipt-long"}
                size={18}
                color={green.textDim}
              />
            </View>
            <View className="flex-1">
              <Text className="text-text font-semibold text-[15px]" style={{ textAlign: textStart }}>
                {p.quantity} {p.unit === "carton" ? s.carton : s.pack}
              </Text>
              <Text className="text-text-dim text-[13px] font-regular mt-0.5" style={{ textAlign: textStart }}>
                {formatTime(p.boughtAt)}
              </Text>
            </View>
            <Text className="text-text font-mono-medium text-[15px]">{money(p.price)}</Text>
            <MaterialIcons name="edit" size={14} color={green.textDim} style={{ marginStart: 8 }} />
          </Pressable>
        )}
      />
      <AddPurchaseSheet ref={purchaseRef} />
    </SafeAreaView>
  );
}
