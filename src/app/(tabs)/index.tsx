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
import { Animated, RefreshControl } from "react-native";
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
import { useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

const HOUR = 60 * 60 * 1000;

/** Today tab: tap-to-log hero ring (count up/down), streak, savings, and recent logs. */
export default function TodayScreen() {
  const s = useStrings();
  const green = useColors();
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
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 22, paddingBottom: 24 }}
        alwaysBounceVertical
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        refreshControl={<RefreshSpinner onRefresh={refresh} tint={green.green} />}
      >
        {/* Header (scrolls with the page) */}
        <Text className="text-green text-[22px] font-bold text-center">{s.reduceTitle}</Text>
        <Text className="text-green text-[17px] font-semibold text-center mt-4">{s.todayImpact}</Text>
        <Text className="text-text-dim text-[13px] font-regular text-center mt-1">{s.keepMomentum}</Text>

        {/* Hero circle — tap to log (the "+" badge signals it adds a cigarette) */}
        <View className="items-center mt-5">
          <Pressable onPress={() => addRef.current?.present()} accessibilityLabel={s.addCigarette}>
            <Animated.View
              style={{
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: green.ring,
                borderWidth: 1,
                borderColor: green.ringStroke,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: green.shadow,
                shadowOpacity: 0.12,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3,
                transform: [{ scale: pulse }],
              }}
            >
              <Text className="text-green text-[44px] font-mono-semibold">{heroCount}</Text>
              <Text className="text-green text-[14px] font-medium mt-1">{heroLabel}</Text>
              <Text className="text-green text-[14px] font-semibold mt-0.5">{heroSub}</Text>
            </Animated.View>
            <View
              className="absolute -bottom-1.5 self-center w-12 h-12 rounded-[24px] bg-green items-center justify-center border-[3px] border-bg"
              style={{ shadowColor: green.shadow, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 }}
            >
              <MaterialIcons name="add" size={26} color={green.onGreen} />
            </View>
          </Pressable>
          <View className="flex-row items-center gap-[5px] mt-4">
            <MaterialIcons name="touch-app" size={14} color={green.textDim} />
            <Text className="text-text-dim text-[12px] font-regular">{s.tapToLog}</Text>
          </View>
        </View>

        {/* Streak pill */}
        <View className="items-center mt-4">
          <View className="flex-row items-center gap-1.5 bg-card-soft rounded-full px-4 py-2">
            <MaterialIcons name="local-fire-department" size={16} color={green.green} />
            <Text className="text-green text-[13px] font-semibold">{s.streakDaysN(streak)}</Text>
          </View>
        </View>

        {/* Weekly savings card */}
        <View className="bg-green-bright rounded-[24px] p-5 mt-5">
          <View className="flex-row items-center gap-2">
            <View className="w-[30px] h-[30px] rounded-[15px] items-center justify-center" style={{ backgroundColor: "rgba(0,80,39,0.12)" }}>
              <MaterialIcons name="attach-money" size={18} color={green.greenDeep} />
            </View>
            <Text className="text-green-deep text-[14px] font-semibold" style={{ textAlign: textStart }}>{s.weeklySavings}</Text>
          </View>
          <Text className="text-green-deep text-[32px] font-bold mt-2" style={{ textAlign: textStart }}>{money(savedWeek)}</Text>
          <View className="flex-row gap-2 mt-4">
            <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[17px] py-[11px]" style={{ backgroundColor: "#FFFFFF" }} onPress={() => purchaseRef.current?.present()}>
              <MaterialIcons name="add-shopping-cart" size={16} color={green.greenDeep} />
              <Text className="text-green-deep text-[13px] font-bold">{s.logPurchaseBtn}</Text>
            </Pressable>
            <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[17px] py-[11px]" style={{ backgroundColor: "#FFFFFF" }} onPress={() => router.push("/purchases")}>
              <MaterialIcons name="history" size={16} color={green.greenDeep} />
              <Text className="text-green-deep text-[13px] font-bold">{s.purchaseHistoryBtn}</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent log */}
        <View className="bg-card rounded-[12px] border border-border p-4 mt-4">
          <Text className="text-text text-[16px] font-bold mb-2" style={{ textAlign: textStart }}>{s.recentLogTitle}</Text>
          {recent.length === 0 ? (
            <Text className="text-text-dim text-[13px] font-regular py-2" style={{ textAlign: textStart }}>{s.nothingToday}</Text>
          ) : (
            recent.map((log, i) => {
              const hasNote = !!(log.comment || log.diary);
              return (
                <Pressable
                  key={log.id}
                  className={`flex-row items-center gap-3 py-3${i > 0 ? " border-t border-border" : ""}`}
                  onPress={() =>
                    detailRef.current?.present({ log, number: numberOf(log), editable: isLogEditable(log, dsh) })
                  }
                >
                  <View className={`w-2 h-2 rounded-full ${hasNote ? "bg-dot" : "bg-border"}`} />
                  <Text className="text-text text-[15px] font-mono-medium">{formatTime(log.smokedAt)}</Text>
                  {log.comment ? (
                    <Text className="flex-1 text-green text-[13px] font-regular" style={{ textAlign: textStart }} numberOfLines={1}>
                      {log.comment}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Momentum quote */}
        <View className="flex-row items-center gap-3 bg-card-soft rounded-[12px] border border-border p-4 mt-4">
          <View className="flex-1">
            <Text className="text-text text-[15px] font-bold" style={{ textAlign: textStart }}>{s.gainingMomentum}</Text>
            <Text className="text-text-dim text-[13px] font-regular mt-1" style={{ textAlign: textStart }}>{quote}</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-bg items-center justify-center">
            <MaterialIcons name="lightbulb-outline" size={20} color={green.green} />
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating add button (appears when the hero is scrolled away) */}
      <Animated.View
        pointerEvents={fabShown ? "box-none" : "none"}
        style={{ position: "absolute", end: 22, bottom: insets.bottom + 76, opacity: fabOpacity, transform: [{ scale: fabScale }] }}
      >
        <Pressable
          className="w-[58px] h-[58px] rounded-[29px] bg-green items-center justify-center"
          style={{ shadowColor: green.shadow, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
          onPress={() => addRef.current?.present()}
          accessibilityLabel={s.addCigarette}
        >
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
