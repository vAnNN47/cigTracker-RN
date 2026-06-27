/**
 * Today — "v2" light/dark themed. Header + sub-headers scroll with the page (so
 * the pull-to-refresh spinner opens its own space above them). The hero circle
 * is the primary action: it gently pulses, carries a "+" badge so it clearly
 * reads as "add a cigarette", and opens the log sheet when tapped. The ring
 * shows count-up (smoked / allowance) or count-down (remaining first) per the
 * Settings "count down" toggle. When the hero scrolls out of view a floating "+"
 * button fades in so logging is always one tap away. Below: streak pill,
 * weekly-savings card, recent-log card (last 6h, up to 5; dot marks notes), and
 * a momentum quote.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/sheets/AddPurchaseSheet";
import { AddSmokeSheet, AddSmokeSheetRef } from "@/components/sheets/AddSmokeSheet";
import { LogDetailSheet, LogDetailSheetRef } from "@/components/sheets/LogDetailSheet";
import { TabHeader } from "@/components/ui/TabHeader";
import { useToast } from "@/components/feedback/Toast";
import { currentLimit, currentStreak, isLogEditable, logicalDay, logicalToday, logsForDay } from "@/domain/logic";
import { formatTime } from "@/i18n/format";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, spacing, useColors } from "@/theme";

const HOUR = 60 * 60 * 1000;

/** Today tab: tap-to-log hero ring (count up/down), streak, savings, and recent logs. */
export default function TodayScreen() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Select only the slices this screen reads (shallow-compared) so an unrelated
  // store write (theme, locale, another tab's data) doesn't re-render it.
  const { logs, limits, purchases, settings } = useAppStore(
    useShallow((st) => ({ logs: st.logs, limits: st.limits, purchases: st.purchases, settings: st.settings })),
  );
  const deleteLog = useAppStore((st) => st.deleteLog);
  const refresh = useAppStore((st) => st.refresh);

  const addRef = useRef<AddSmokeSheetRef>(null);
  const purchaseRef = useRef<AddPurchaseSheetRef>(null);
  const detailRef = useRef<LogDetailSheetRef>(null);

  const dsh = settings.dayStartHour;
  const todayKey = logicalToday(dsh);
  const count = logsForDay(logs, todayKey, dsh).length;
  const limit = currentLimit(limits, settings);
  const streak = currentStreak(logs, limits, settings);
  const left = Math.max(0, limit - count);

  // Hero ring counts up (smoked) or down (remaining) per the setting.
  const heroCount = settings.countDown ? `${left}/${limit}` : `${count}/${limit}`;
  const heroLabel = settings.countDown ? s.remainingTodayShort : s.smokedTodayShort;
  const heroSub = settings.countDown ? s.smokedTodayN(count) : s.leftTodayN(left);

  // Gentle pulse so the circle reads as tappable.
  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Floating add button: fades in once the hero circle has scrolled away, so the
  // user never has to scroll back up to log (task: pinned add button).
  const [scrollY] = useState(() => new Animated.Value(0));
  const [fabShown, setFabShown] = useState(false);
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const v = value > 300;
      setFabShown((prev) => (prev === v ? prev : v));
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);
  const fabOpacity = scrollY.interpolate({ inputRange: [240, 320], outputRange: [0, 1], extrapolate: "clamp" });
  const fabScale = scrollY.interpolate({ inputRange: [240, 320], outputRange: [0.8, 1], extrapolate: "clamp" });

  // Weekly savings (matches the "חיסכון שבועי" card).
  const cur = settings.currencySymbol;
  const money = (n: number) => `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 24 * HOUR;
  const spentWeek = purchases.filter((p) => p.boughtAt.getTime() >= weekAgo).reduce((a, p) => a + p.price, 0);
  const wouldHaveWeek = ((settings.baselinePerDay * 7) / 20) * settings.pricePerPack;
  const savedWeek = Math.max(0, Math.round(wouldHaveWeek - spentWeek));

  // Recent: last 6 hours, newest first, up to 5.
  const sixAgo = now.getTime() - 6 * HOUR;
  const recent = [...logs]
    .filter((l) => l.smokedAt.getTime() >= sixAgo)
    .sort((a, b) => b.smokedAt.getTime() - a.smokedAt.getTime())
    .slice(0, 5);

  const numberOf = (log: SmokeLog) => {
    const dayLogs = logsForDay(logs, logicalDay(log.smokedAt, dsh), dsh);
    return dayLogs.findIndex((l) => l.id === log.id) + 1;
  };

  const quote = s.quotes[now.getDate() % s.quotes.length];

  const onLogged = (log: SmokeLog) => {
    toast.show({ message: s.loggedToast, actionLabel: s.undo, onAction: () => deleteLog(log.id) });
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <TabHeader title={s.appTitle} />

      <Animated.ScrollView
        style={{ backgroundColor: green.bg }}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingHorizontal: 22, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        refreshControl={<RefreshSpinner onRefresh={refresh} tint={green.green} />}
      >
        {/* Header (scrolls with the page) */}
        <Text style={styles.brand}>{s.reduceTitle}</Text>
        <Text style={styles.impact}>{s.todayImpact}</Text>
        <Text style={styles.momentum}>{s.keepMomentum}</Text>

        {/* Hero circle — tap to log (the "+" badge signals it adds a cigarette) */}
        <View style={styles.heroWrap}>
          <Pressable onPress={() => addRef.current?.present()} accessibilityLabel={s.addCigarette}>
            <Animated.View style={[styles.hero, { transform: [{ scale: pulse }] }]}>
              <Text style={styles.heroCount}>{heroCount}</Text>
              <Text style={styles.heroLabel}>{heroLabel}</Text>
              <Text style={styles.heroLeft}>{heroSub}</Text>
            </Animated.View>
            <View style={styles.heroPlus}>
              <MaterialIcons name="add" size={26} color={green.onGreen} />
            </View>
          </Pressable>
          <View style={styles.tapHintRow}>
            <MaterialIcons name="touch-app" size={14} color={green.textDim} />
            <Text style={styles.tapHint}>{s.tapToLog}</Text>
          </View>
        </View>

        {/* Streak pill */}
        <View style={styles.streakWrap}>
          <View style={styles.streakPill}>
            <MaterialIcons name="local-fire-department" size={16} color={green.green} />
            <Text style={styles.streakText}>{s.streakDaysN(streak)}</Text>
          </View>
        </View>

        {/* Weekly savings card */}
        <View style={styles.saveCard}>
          <View style={styles.saveTop}>
            <View style={styles.saveIcon}>
              <MaterialIcons name="attach-money" size={18} color={green.greenDeep} />
            </View>
            <Text style={styles.saveLabel}>{s.weeklySavings}</Text>
          </View>
          <Text style={styles.saveValue}>{money(savedWeek)}</Text>
          <View style={styles.saveActions}>
            <Pressable style={styles.saveBtn} onPress={() => purchaseRef.current?.present()}>
              <MaterialIcons name="add-shopping-cart" size={16} color={green.greenDeep} />
              <Text style={styles.saveBtnText}>{s.logPurchaseBtn}</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => router.push("/purchases")}>
              <MaterialIcons name="history" size={16} color={green.greenDeep} />
              <Text style={styles.saveBtnText}>{s.purchaseHistoryBtn}</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{s.recentLogTitle}</Text>
          {recent.length === 0 ? (
            <Text style={styles.empty}>{s.nothingToday}</Text>
          ) : (
            recent.map((log, i) => {
              const hasNote = !!(log.comment || log.diary);
              return (
                <Pressable
                  key={log.id}
                  style={[styles.recentRow, i > 0 && styles.recentDivider]}
                  onPress={() =>
                    detailRef.current?.present({ log, number: numberOf(log), editable: isLogEditable(log, dsh) })
                  }
                >
                  <View style={[styles.recentDot, !hasNote && styles.recentDotMuted]} />
                  <Text style={styles.recentTime}>{formatTime(log.smokedAt)}</Text>
                  {log.comment ? (
                    <Text style={styles.recentNote} numberOfLines={1}>
                      {log.comment}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Momentum quote */}
        <View style={styles.quoteCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteTitle}>{s.gainingMomentum}</Text>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>
          <View style={styles.quoteIcon}>
            <MaterialIcons name="lightbulb-outline" size={20} color={green.green} />
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating add button (appears when the hero is scrolled away) */}
      <Animated.View
        pointerEvents={fabShown ? "box-none" : "none"}
        style={[styles.fabWrap, { bottom: insets.bottom + 76, opacity: fabOpacity, transform: [{ scale: fabScale }] }]}
      >
        <Pressable style={styles.fab} onPress={() => addRef.current?.present()} accessibilityLabel={s.addCigarette}>
          <MaterialIcons name="add" size={28} color={green.onGreen} />
        </Pressable>
      </Animated.View>

      <AddSmokeSheet ref={addRef} onLogged={onLogged} />
      <AddPurchaseSheet ref={purchaseRef} />
      <LogDetailSheet ref={detailRef} />
    </SafeAreaView>
  );
}

// Pull-to-refresh control (kept separate so the spinner owns its own state).
function RefreshSpinner({ onRefresh, tint }: { onRefresh: () => void | Promise<void>; tint: string }) {
  const [refreshing, setRefreshing] = useState(false);
  const handle = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
  return <RefreshControl refreshing={refreshing} onRefresh={handle} tintColor={tint} colors={[tint]} />;
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    brand: { color: green.green, fontSize: 22, fontFamily: fonts.bold, textAlign: "center" },
    impact: { color: green.green, fontSize: 17, fontFamily: fonts.semibold, textAlign: "center", marginTop: spacing.lg },
    momentum: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, textAlign: "center", marginTop: 4 },

    heroWrap: { alignItems: "center", marginTop: spacing.xl },
    hero: {
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: green.ring,
      borderWidth: 1,
      borderColor: green.ringStroke,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#1B2A4A",
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    heroCount: { color: green.green, fontSize: 44, fontFamily: fonts.monoSemibold },
    heroLabel: { color: green.green, fontSize: 14, fontFamily: fonts.medium, marginTop: 4 },
    heroLeft: { color: green.green, fontSize: 14, fontFamily: fonts.semibold, marginTop: 2 },
    // "+" badge pinned to the bottom of the ring so the circle clearly reads as
    // the add-a-cigarette action.
    heroPlus: {
      position: "absolute",
      bottom: -6,
      alignSelf: "center",
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: green.green,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: green.bg,
      shadowColor: "#1B2A4A",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    tapHintRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: spacing.lg },
    tapHint: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },

    streakWrap: { alignItems: "center", marginTop: spacing.lg },
    streakPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: green.cardSoft,
      borderRadius: 999,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    streakText: { color: green.green, fontSize: 13, fontFamily: fonts.semibold },

    saveCard: {
      backgroundColor: green.greenBright,
      borderRadius: 24,
      padding: spacing.xl,
      marginTop: spacing.xl,
    },
    saveTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    saveIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "rgba(0,80,39,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    saveLabel: { color: green.greenDeep, fontSize: 14, fontFamily: fonts.semibold, textAlign: textStart },
    saveValue: { color: green.greenDeep, fontSize: 32, fontFamily: fonts.bold, marginTop: spacing.sm, textAlign: textStart },
    saveActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
    saveBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      // The savings card is bright-green in BOTH themes, so its buttons need a
      // fixed light fill — using green.bg made them dark-on-dark (invisible) in
      // dark mode.
      backgroundColor: "#FFFFFF",
      borderRadius: 17,
      paddingVertical: 11,
    },
    saveBtnText: { color: green.greenDeep, fontSize: 13, fontFamily: fonts.bold },

    card: {
      backgroundColor: green.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: green.border,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    cardTitle: { color: green.text, fontSize: 16, fontFamily: fonts.bold, marginBottom: spacing.sm, textAlign: textStart },
    empty: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, paddingVertical: spacing.sm, textAlign: textStart },
    recentRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 12 },
    recentDivider: { borderTopWidth: 1, borderTopColor: green.border },
    recentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: green.dot },
    recentDotMuted: { backgroundColor: green.border },
    recentTime: { color: green.text, fontSize: 15, fontFamily: fonts.monoMedium },
    recentNote: { flex: 1, color: green.green, fontSize: 13, fontFamily: fonts.regular, textAlign: textStart },

    quoteCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: green.cardSoft,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: green.border,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    quoteTitle: { color: green.text, fontSize: 15, fontFamily: fonts.bold, textAlign: textStart },
    quoteText: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 4, textAlign: textStart },
    quoteIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: green.bg,
      alignItems: "center",
      justifyContent: "center",
    },

    fabWrap: { position: "absolute", end: 22 },
    fab: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: green.green,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#1B2A4A",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  }),
);
