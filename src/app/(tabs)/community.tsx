/**
 * Community — its own tab (was a drawer link before). A light/dark themed feed:
 * a "share your progress" prompt, topic chips, and a scrollable list of dummy
 * posts (avatar + name + time + text + like/reply counts). Content is dummy for
 * now; the compose / like actions just toast "coming soon".
 */
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabHeader } from "@/components/ui/TabHeader";
import { useToast } from "@/components/feedback/Toast";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { fonts, makeUseStyles, radius, spacing, useColors } from "@/theme";

// Stable accent per author so avatars look distinct without real images.
const AVATAR_TINTS = ["#2ECC71", "#7FB8C9", "#E0A98A", "#C69CE0"];

/** Community tab: a (currently dummy) social feed with compose/like stubs. */
export default function CommunityScreen() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const toast = useToast();

  const soon = () => toast.show({ message: s.comingSoon });

  const topics = [
    { icon: "emoji-events", label: s.topicMilestones },
    { icon: "bolt", label: s.topicCravings },
    { icon: "savings", label: s.topicSavings },
    { icon: "favorite", label: s.topicSupport },
  ] as const;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <TabHeader />
      <ScrollView
        style={{ flex: 1, backgroundColor: green.bg }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingHorizontal: 22, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
      >
        <Text style={styles.title}>{s.community}</Text>
        <Text style={styles.intro}>{s.communityIntro}</Text>

        {/* Share prompt */}
        <View style={styles.shareCard}>
          <View style={styles.shareIcon}>
            <MaterialIcons name="campaign" size={20} color={green.greenDeep} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shareTitle}>{s.communityShareTitle}</Text>
            <Text style={styles.shareSub}>{s.communityShareSub}</Text>
          </View>
        </View>
        <Text style={styles.shareBtn} onPress={soon} suppressHighlighting>
          {s.communityShareBtn}
        </Text>

        {/* Topics */}
        <Text style={styles.section}>{s.communityTopics}</Text>
        <View style={styles.topicRow}>
          {topics.map((t) => (
            <View key={t.label} style={styles.topicChip}>
              <MaterialIcons name={t.icon} size={15} color={green.green} />
              <Text style={styles.topicText}>{t.label}</Text>
            </View>
          ))}
        </View>

        {/* Feed */}
        <Text style={styles.section}>{s.communityFeed}</Text>
        {s.communityPosts.map((p, i) => (
          <View key={i} style={styles.post}>
            <View style={styles.postHead}>
              <View style={[styles.avatar, { backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length] }]}>
                <Text style={styles.avatarText}>{p.name.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.postName}>{p.name}</Text>
                <Text style={styles.postTime}>{p.time}</Text>
              </View>
            </View>
            <Text style={styles.postText}>{p.text}</Text>
            <View style={styles.postMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="favorite-border" size={15} color={green.textDim} />
                <Text style={styles.metaText}>{s.likesN(p.likes)}</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="chat-bubble-outline" size={14} color={green.textDim} />
                <Text style={styles.metaText}>{s.repliesN(p.replies)}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    title: { color: green.text, fontSize: 24, fontFamily: fonts.bold, textAlign: textStart },
    intro: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },

    shareCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: green.cardSoft,
      borderRadius: radius.card,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    shareIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: green.greenBright,
      alignItems: "center",
      justifyContent: "center",
    },
    shareTitle: { color: green.text, fontSize: 15, fontFamily: fonts.bold, textAlign: textStart },
    shareSub: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
    shareBtn: {
      color: green.onGreen,
      backgroundColor: green.green,
      fontFamily: fonts.bold,
      fontSize: 14,
      textAlign: "center",
      borderRadius: radius.button,
      paddingVertical: 12,
      marginTop: spacing.md,
      overflow: "hidden",
    },

    section: {
      color: green.textDim,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      fontFamily: fonts.medium,
      marginTop: spacing.xxl,
      marginBottom: spacing.sm,
      textAlign: textStart,
    },
    topicRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    topicChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: green.cardSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
    },
    topicText: { color: green.text, fontSize: 13, fontFamily: fonts.semibold },

    post: {
      backgroundColor: green.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: green.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    postHead: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#04231A", fontSize: 16, fontFamily: fonts.bold },
    postName: { color: green.text, fontSize: 15, fontFamily: fonts.bold, textAlign: textStart },
    postTime: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular, marginTop: 1, textAlign: textStart },
    postText: { color: green.textSecondary, fontSize: 14, fontFamily: fonts.regular, lineHeight: 21, marginTop: spacing.md, textAlign: textStart },
    postMeta: { flexDirection: "row", gap: spacing.xl, marginTop: spacing.md },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular },
  }),
);
