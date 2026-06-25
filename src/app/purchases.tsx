/**
 * Purchases history — opened from Today's "Recent Purchase → View History".
 * Lists every purchase grouped by day (newest first) with a per-day total and a
 * grand total at the top. Read-only.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/sheets/AddPurchaseSheet";
import { dayKey, keyOf } from "@/domain/day";
import { formatTime, formatWeekdayDate } from "@/i18n/format";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { Purchase } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, radius, spacing, useColors } from "@/theme";

interface DayGroup {
  key: string;
  date: Date;
  total: number;
  items: Purchase[];
}

/** Read-only purchase history grouped by day, with per-day and grand totals. */
export default function PurchasesScreen() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const router = useRouter();
  const { purchases, settings } = useAppStore();
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
        g = { key: k, date: keyOf(p.boughtAt), total: 0, items: [] };
        map.set(k, g);
        out.push(g);
      }
      g.items.push(p);
      g.total += p.price;
    }
    return { groups: out, grandTotal: sorted.reduce((a, p) => a + p.price, 0) };
  }, [purchases]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name={backIcon} size={26} color={green.text} />
        </Pressable>
        <Text style={styles.title}>{s.purchaseHistory}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
      >
        {groups.length === 0 ? (
          <Text style={styles.empty}>{s.noPurchasesYet}</Text>
        ) : (
          <>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>{s.totalSpentLabel}</Text>
              <Text style={styles.totalValue}>{money(grandTotal)}</Text>
            </View>

            {groups.map((g) => (
              <View key={g.key} style={styles.group}>
                <View style={styles.groupHead}>
                  <Text style={styles.groupDate}>{formatWeekdayDate(g.date, s.localeCode)}</Text>
                  <Text style={styles.groupTotal}>{money(g.total)}</Text>
                </View>
                {g.items.map((p) => (
                  <Pressable key={p.id} style={styles.row} onPress={() => purchaseRef.current?.present(p)}>
                    <View style={styles.rowIcon}>
                      <MaterialIcons
                        name={p.unit === "carton" ? "inventory-2" : "receipt-long"}
                        size={18}
                        color={green.textDim}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {p.quantity} {p.unit === "carton" ? s.carton : s.pack}
                      </Text>
                      <Text style={styles.rowSub}>{formatTime(p.boughtAt)}</Text>
                    </View>
                    <Text style={styles.price}>{money(p.price)}</Text>
                    <MaterialIcons name="edit" size={14} color={green.textDim} style={{ marginStart: spacing.sm }} />
                  </Pressable>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <AddPurchaseSheet ref={purchaseRef} />
    </SafeAreaView>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { color: green.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
  empty: { color: green.textDim, fontFamily: fonts.regular, paddingVertical: spacing.xxl, textAlign: "center" },

  totalCard: {
    backgroundColor: green.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: green.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  totalLabel: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, textAlign: textStart },
  totalValue: { color: green.text, fontSize: 28, fontFamily: fonts.monoSemibold, marginTop: 2, textAlign: textStart },

  group: { marginBottom: spacing.lg },
  groupHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  groupDate: { color: green.text, fontSize: 15, fontFamily: fonts.bold, textAlign: textStart },
  groupTotal: { color: green.textDim, fontSize: 14, fontFamily: fonts.monoMedium },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: green.border,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: green.cardSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: green.text, fontFamily: fonts.semibold, fontSize: 15, textAlign: textStart },
  rowSub: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  price: { color: green.text, fontFamily: fonts.monoMedium, fontSize: 15 },
  }),
);
