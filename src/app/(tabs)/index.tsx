/**
 * Today — "v2" light/dark themed. Header + sub-headers scroll with the page (so
 * the pull-to-refresh spinner opens its own space above them). The hero circle
 * is the primary action: a subtle one-shot "pop" hint fires each time you land
 * on Today (teaching it's tappable), and it opens the log sheet when tapped. The
 * ring shows count-up (smoked / allowance) or count-down (remaining first) per
 * the Settings "count down" toggle. When the hero scrolls out of view a floating
 * "+" button pops in (start-side) so logging is always one tap away. Below: streak pill,
 * weekly-savings card, recent-log card (last 6h, up to 5; dot marks notes), and
 * a momentum quote.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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
import { Pressable, ScrollView, Text, View } from "@/tw";

const HOUR = 60 * 60 * 1000;
const HERO_DEPTH = 8; // px the hero "button" face sits above its darker 3D base

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

  // Pull-to-refresh. RefreshControl must be passed to the ScrollView as a *direct*
  // <RefreshControl> element — wrapping it in a custom component makes Android drop
  // all ScrollView children (see rn-debug KI-1).
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const addRef = useRef<AddSmokeSheetRef>(null);
  const purchaseRef = useRef<AddPurchaseSheetRef>(null);
  const detailRef = useRef<LogDetailSheetRef>(null);

  const dsh = settings.dayStartHour;
  const todayKey = logicalToday(dsh);
  const count = logsForDay(logs, todayKey, dsh).length;
  const limit = currentLimit(limits, settings);
  const streak = currentStreak(logs, limits, settings);
  const left = Math.max(0, limit - count);
  // Past the daily limit — drives the hero's over-budget cue (red number + pill).
  const over = count > limit;
  const overBy = count - limit;

  // Hero ring counts up (smoked) or down (remaining) per the setting.
  const heroCount = settings.countDown ? `${left}/${limit}` : `${count}/${limit}`;
  const heroLabel = settings.countDown ? s.remainingTodayShort : s.smokedTodayShort;
  const heroSub = settings.countDown ? s.smokedTodayN(count) : s.leftTodayN(left);

  // One-shot "tap me" hint: a subtle pop each time you land on Today (replaces
  // the old infinite pulse + the "+" badge — the nudge teaches tappability).
  const hint = useSharedValue(1);
  const navigation = useNavigation();
  useEffect(() => {
    const run = () => {
      hint.value = withSequence(
        withTiming(1.05, { duration: 240 }),
        withSpring(1, { damping: 6, stiffness: 150 }),
      );
    };
    run(); // first entry (mount)
    return navigation.addListener("focus", run); // every return to the tab
  }, [navigation, hint]);
  // Press depresses the hero onto its base (0→1 = up→down) for a tactile button.
  const press = useSharedValue(0);
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * HERO_DEPTH }, { scale: hint.value }],
  }));

  // Floating add button: POPS in (spring overshoot) once the hero circle has
  // scrolled away, so logging is always one tap away (task: pinned add button).
  const [fabShown, setFabShown] = useState(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setFabShown((prev) => {
      const v = y > 300;
      return prev === v ? prev : v;
    });
  };
  const fabAppear = useSharedValue(0);
  useEffect(() => {
    fabAppear.value = fabShown
      ? withSpring(1, { damping: 9, stiffness: 170, mass: 0.6 })
      : withTiming(0, { duration: 140 });
  }, [fabShown, fabAppear]);
  const fabStyle = useAnimatedStyle(() => ({
    opacity: fabAppear.value,
    transform: [{ scale: fabAppear.value }],
  }));

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

      <ScrollView
        className="flex-1 bg-bg"
        contentContainerClassName="pt-4 px-[22px] pb-6"
        alwaysBounceVertical
        scrollEventThrottle={16}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={green.green} colors={[green.green]} />
        }
      >
        {/* Header (scrolls with the page) */}
        <Text className="text-green text-[22px] font-bold text-center">{s.reduceTitle}</Text>
        <Text className="text-green text-[17px] font-semibold text-center mt-4">{s.todayImpact}</Text>
        <Text className="text-text-dim text-[13px] font-regular text-center mt-1">{s.keepMomentum}</Text>

        {/* Hero circle — tap to log (the "+" badge signals it adds a cigarette) */}
        <View className="items-center mt-5">
          <Pressable
            onPress={() => addRef.current?.present()}
            onPressIn={() => {
              press.value = withTiming(1, { duration: 60 });
            }}
            onPressOut={() => {
              press.value = withSpring(0, { damping: 12, stiffness: 220 });
            }}
            accessibilityLabel={over ? `${s.addCigarette}, ${s.overLimit(overBy)}` : s.addCigarette}
          >
            {/* 3D button: a darker base peeks below the top face = physical
                thickness; pressing translates the face down onto the base. */}
            <View style={{ width: 220, height: 220 + HERO_DEPTH, alignItems: "center" }}>
              <View
                style={{
                  position: "absolute",
                  top: HERO_DEPTH,
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  backgroundColor: green.ringDeep,
                }}
              />
              <Animated.View
                style={[
                  {
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    backgroundColor: green.ring,
                    borderWidth: 1,
                    borderColor: over ? green.overBorder : green.ringStroke,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: green.shadow,
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 6,
                  },
                  heroStyle,
                ]}
              >
              <Text className={`${over ? "text-over-text" : "text-green"} text-[44px] font-mono-semibold`}>{heroCount}</Text>
              <Text className="text-green text-[14px] font-medium mt-1">{heroLabel}</Text>
              <Text className="text-green text-[14px] font-semibold mt-0.5">{heroSub}</Text>
              {/* Over-budget cue: red number + ring border isn't conveyed by color
                  alone — this pill spells out how far over (WCAG 1.4.1). */}
              {over && (
                <View className="bg-over-bg rounded-full px-2.5 py-0.5 mt-1.5">
                  <Text className="text-over-text text-[11px] font-bold">{s.overLimit(overBy)}</Text>
                </View>
              )}
              </Animated.View>
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
                  {/* Baseline-align so the smaller note text sits on the time's baseline
                      (items-center would float the 13px note off the 15px time). */}
                  <View className="flex-1 flex-row items-baseline gap-3">
                    <Text className="text-text text-[15px] font-mono-medium">{formatTime(log.smokedAt)}</Text>
                    {log.comment ? (
                      <Text className="flex-1 text-green text-[13px] font-regular" style={{ textAlign: textStart }} numberOfLines={1}>
                        {log.comment}
                      </Text>
                    ) : null}
                  </View>
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
      </ScrollView>

      {/* Floating add button (appears when the hero is scrolled away) */}
      <Animated.View
        pointerEvents={fabShown ? "box-none" : "none"}
        style={[{ position: "absolute", start: 22, bottom: insets.bottom + 76 }, fabStyle]}
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
