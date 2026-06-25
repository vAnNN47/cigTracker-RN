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
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SlideDrawer } from "@/components/drawers/SlideDrawer";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useDrawerStore } from "@/store/useDrawerStore";
import { fonts, makeUseStyles, spacing, useColors } from "@/theme";

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
  const styles = useStyles();
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
        <SafeAreaView style={[styles.safe, styles.subSafe]} edges={["top", "bottom"]}>
          <View style={styles.subHeader}>
            <Pressable onPress={() => setSub(null)} hitSlop={10} style={styles.backBtn}>
              <MaterialIcons name={backIcon} size={24} color={green.text} />
            </Pressable>
            <Text style={styles.subTitle}>{shownLink?.label}</Text>
            <View style={styles.backBtn} />
          </View>
          <ScrollView contentContainerStyle={styles.subBody}>
            <View style={styles.subIcon}>
              {shownLink && <MaterialIcons name={shownLink.icon} size={32} color={green.green} />}
            </View>
            <Text style={styles.subHeadline}>{shownLink?.label}</Text>
            <Text style={styles.subText}>{DUMMY_BODY}</Text>
            <Text style={styles.subText}>{DUMMY_BODY}</Text>
          </ScrollView>
        </SafeAreaView>
      }
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Text style={styles.title}>{s.menu}</Text>
        <Text style={styles.sectionTitle}>{cfg.title}</Text>
        {cfg.links.map((l) => (
          <Row key={l.label} icon={l.icon} label={l.label} onPress={() => openLink(l)} />
        ))}
      </SafeAreaView>
    </SlideDrawer>
  );
}

function Row({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) {
  const green = useColors();
  const styles = useStyles();
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={20} color={green.green} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={20} color={green.textDim} />
    </Pressable>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    safe: { flex: 1, paddingHorizontal: spacing.lg },
    subSafe: { backgroundColor: green.bg },
    title: { color: green.green, fontSize: 22, fontFamily: fonts.bold, marginTop: spacing.lg, textAlign: textStart },
    sectionTitle: {
      color: green.textDim,
      fontSize: 12,
      fontFamily: fonts.medium,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
      textAlign: textStart,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: green.border,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: green.cardSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: { flex: 1, color: green.text, fontSize: 15, fontFamily: fonts.semibold, textAlign: textStart },

    subHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    subTitle: { flex: 1, color: green.text, fontSize: 18, fontFamily: fonts.bold, textAlign: "center" },
    subBody: { paddingVertical: spacing.xl, alignItems: "center" },
    subIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: green.cardSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    subHeadline: { color: green.text, fontSize: 20, fontFamily: fonts.bold, marginBottom: spacing.md, textAlign: "center" },
    subText: { color: green.textDim, fontSize: 14, fontFamily: fonts.regular, lineHeight: 22, marginBottom: spacing.md, textAlign: textStart },
  }),
);
