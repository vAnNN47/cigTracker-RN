/**
 * Main drawer (≈76%, opens from the burger on the RTL/right side). Its contents
 * are DYNAMIC per tab: each tab (Today / Diary / Community / Progress) shows its
 * own 2–3 quick links (task: per-tab drawer). Tapping a link EXPANDS the same
 * 76% drawer to a full screen in place (with a back button) — back collapses it
 * back to 76%, the scrim closes the whole drawer (task: 70% → 100% drawer screens).
 * Settings now lives in the Account drawer, so it's no longer listed here.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useState } from "react";
import { I18nManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SlideDrawer } from "@/components/drawers/SlideDrawer";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";

type Link = { icon: keyof typeof MaterialIcons.glyphMap; label: string };
type TabKey = "today" | "diary" | "community" | "progress";

// Per-tab quick links (dummy). Section title + 2–3 links each.
function tabConfig(he: boolean): Record<TabKey, { title: string; links: Link[] }> {
  return {
    today: {
      title: he ? "היום" : "Today",
      links: [
        { icon: "tips-and-updates", label: he ? "טיפ יומי" : "Daily tip" },
        { icon: "alarm", label: he ? "תזכורות" : "Reminders" },
        { icon: "bolt", label: he ? "רישום מהיר" : "Quick presets" },
      ],
    },
    diary: {
      title: he ? "יומן" : "Diary",
      links: [
        { icon: "ios-share", label: he ? "ייצוא יומן" : "Export diary" },
        { icon: "mood", label: he ? "מגמות מצב רוח" : "Mood trends" },
        { icon: "bookmark-border", label: he ? "רשומות שמורות" : "Saved notes" },
      ],
    },
    community: {
      title: he ? "קהילה" : "Community",
      links: [
        { icon: "groups", label: he ? "הקבוצות שלי" : "My groups" },
        { icon: "favorite-border", label: he ? "פוסטים שמורים" : "Saved posts" },
        { icon: "person-add-alt", label: he ? "מצא חברים" : "Find friends" },
      ],
    },
    progress: {
      title: he ? "התקדמות" : "Progress",
      links: [
        { icon: "flag", label: he ? "יעדים" : "Goals" },
        { icon: "emoji-events", label: he ? "הישגים" : "Achievements" },
        { icon: "summarize", label: he ? "דוח שבועי" : "Weekly report" },
      ],
    },
  };
}

function tabFromPath(path: string): TabKey {
  if (path.startsWith("/calendar")) return "diary";
  if (path.startsWith("/community")) return "community";
  if (path.startsWith("/progress")) return "progress";
  return "today";
}

const DUMMY_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

/** Burger-side drawer with per-tab quick links; expands in place to a full screen. */
export function MainDrawer() {
  const s = useStrings();
  const green = useColors();
  const open = useDrawerStore((st) => st.open) === "main";
  const hide = useDrawerStore((st) => st.hide);
  const path = usePathname();
  const tab = tabFromPath(path);
  const cfg = tabConfig(s.he)[tab];

  // The sub-screen opened from a link, tagged with the tab it belongs to. It's
  // only shown while you're still on that tab — switching tabs collapses it.
  const [sub, setSub] = useState<{ tab: TabKey; link: Link } | null>(null);
  const activeLink = sub && sub.tab === tab ? sub.link : null;
  // Retained so the screen keeps its content through the collapse animation
  // (activeLink flips to null immediately; this lingers until fully closed).
  const [shownLink, setShownLink] = useState<Link | null>(null);
  const openLink = (l: Link) => {
    setShownLink(l);
    setSub({ tab, link: l });
  };

  // Reset to the collapsed list whenever the whole drawer closes (during render),
  // so it reopens at 76% rather than mid-expand.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setSub(null);
  }

  // Burger sits on the reading START edge, so the drawer opens from the start:
  // right in Hebrew (RTL), left in English (LTR). The sub-screen grows from the
  // same edge in place.
  const backIcon = I18nManager.isRTL ? "arrow-forward" : "arrow-back";

  return (
    <SlideDrawer
      open={open}
      side="start"
      widthPct={0.76}
      expanded={activeLink !== null}
      onClose={hide}
      onCollapse={() => setSub(null)}
      expandedContent={
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: green.bg }} edges={["top", "bottom"]}>
          <View className="flex-row items-center py-2">
            <Pressable onPress={() => setSub(null)} hitSlop={10} className="w-9 h-9 items-center justify-center" accessibilityRole="button" accessibilityLabel={s.a11yBack}>
              <MaterialIcons name={backIcon} size={24} color={green.text} />
            </Pressable>
            <Text className="flex-1 text-text text-[18px] font-bold text-center">{shownLink?.label}</Text>
            <View className="w-9 h-9 items-center justify-center" />
          </View>
          <ScrollView contentContainerClassName="py-5 items-center">
            <View className="w-16 h-16 rounded-[32px] bg-card-soft items-center justify-center mb-4">
              {shownLink && <MaterialIcons name={shownLink.icon} size={32} color={green.green} />}
            </View>
            <Text className="text-text text-[20px] font-bold mb-3 text-center">{shownLink?.label}</Text>
            <Text className="text-text-dim text-[14px] font-regular leading-[22px] mb-3" style={{ textAlign: textStart }}>{DUMMY_BODY}</Text>
            <Text className="text-text-dim text-[14px] font-regular leading-[22px] mb-3" style={{ textAlign: textStart }}>{DUMMY_BODY}</Text>
          </ScrollView>
        </SafeAreaView>
      }
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }} edges={["top", "bottom"]}>
        <Text className="text-green text-[22px] font-bold mt-4" style={{ textAlign: textStart }}>{s.menu}</Text>
        <Text className="text-text-dim text-[12px] font-medium uppercase tracking-[1.2px] mt-4 mb-1" style={{ textAlign: textStart }}>{cfg.title}</Text>
        {cfg.links.map((l) => (
          <Row key={l.label} icon={l.icon} label={l.label} onPress={() => openLink(l)} />
        ))}
      </SafeAreaView>
    </SlideDrawer>
  );
}

function Row({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) {
  const green = useColors();
  return (
    <Pressable className="flex-row items-center gap-3 py-3 border-b border-border" onPress={onPress}>
      <View className="w-9 h-9 rounded-[18px] bg-card-soft items-center justify-center">
        <MaterialIcons name={icon} size={20} color={green.green} />
      </View>
      <Text className="flex-1 text-text text-[15px] font-semibold" style={{ textAlign: textStart }}>{label}</Text>
      <MaterialIcons name="chevron-right" size={20} color={green.textDim} />
    </Pressable>
  );
}
