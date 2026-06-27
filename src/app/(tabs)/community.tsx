/**
 * Community — its own tab (was a drawer link before). A light/dark themed feed:
 * a "share your progress" prompt, topic chips, and a scrollable list of dummy
 * posts (avatar + name + time + text + like/reply counts). Content is dummy for
 * now; the compose / like actions just toast "coming soon".
 *
 * NativeWind pilot (StyleSheet → className migration): styling is Tailwind via
 * `@/tw` wrappers + tokens in `src/global.css`. Icon colors (MaterialIcons takes
 * a `color` prop, not className) and the safe-area background still read
 * `useColors()`. RTL text alignment stays as an inline `textStart` style — RN's
 * `textAlign` has no writing-direction-aware class, so the i18n helper drives it.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabHeader } from "@/components/ui/TabHeader";
import { useToast } from "@/components/feedback/Toast";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useColors } from "@/theme";
import { ScrollView, Text, View } from "@/tw";

// Stable accent per author so avatars look distinct without real images.
const AVATAR_TINTS = ["#2ECC71", "#7FB8C9", "#E0A98A", "#C69CE0"];

/** Community tab: a (currently dummy) social feed with compose/like stubs. */
export default function CommunityScreen() {
  const s = useStrings();
  const green = useColors();
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
        className="flex-1 bg-bg"
        contentContainerClassName="pt-2 px-[22px] pb-6"
        alwaysBounceVertical
        overScrollMode="always"
      >
        <Text className="text-text text-[24px] font-bold" style={{ textAlign: textStart }}>
          {s.community}
        </Text>
        <Text className="text-text-dim text-[13px] font-regular mt-0.5" style={{ textAlign: textStart }}>
          {s.communityIntro}
        </Text>

        {/* Share prompt */}
        <View className="flex-row items-center gap-3 bg-card-soft rounded-card p-4 mt-4">
          <View className="w-[38px] h-[38px] rounded-[19px] bg-green-bright items-center justify-center">
            <MaterialIcons name="campaign" size={20} color={green.greenDeep} />
          </View>
          <View className="flex-1">
            <Text className="text-text text-[15px] font-bold" style={{ textAlign: textStart }}>
              {s.communityShareTitle}
            </Text>
            <Text className="text-text-dim text-[13px] font-regular mt-0.5" style={{ textAlign: textStart }}>
              {s.communityShareSub}
            </Text>
          </View>
        </View>
        <Text
          className="text-on-green bg-green font-bold text-[14px] text-center rounded-button py-3 mt-3 overflow-hidden"
          onPress={soon}
          suppressHighlighting
        >
          {s.communityShareBtn}
        </Text>

        {/* Topics */}
        <Text
          className="text-text-dim text-[12px] uppercase tracking-[1.2px] font-medium mt-6 mb-2"
          style={{ textAlign: textStart }}
        >
          {s.communityTopics}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {topics.map((t) => (
            <View key={t.label} className="flex-row items-center gap-1.5 bg-card-soft rounded-pill px-3 py-2">
              <MaterialIcons name={t.icon} size={15} color={green.green} />
              <Text className="text-text text-[13px] font-semibold">{t.label}</Text>
            </View>
          ))}
        </View>

        {/* Feed */}
        <Text
          className="text-text-dim text-[12px] uppercase tracking-[1.2px] font-medium mt-6 mb-2"
          style={{ textAlign: textStart }}
        >
          {s.communityFeed}
        </Text>
        {s.communityPosts.map((p, i) => (
          <View key={i} className="bg-card rounded-card border border-border p-4 mb-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-[38px] h-[38px] rounded-[19px] items-center justify-center"
                style={{ backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length] }}
              >
                <Text className="text-[16px] font-bold" style={{ color: "#04231A" }}>
                  {p.name.slice(0, 1)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text text-[15px] font-bold" style={{ textAlign: textStart }}>
                  {p.name}
                </Text>
                <Text className="text-text-dim text-[12px] font-regular mt-px" style={{ textAlign: textStart }}>
                  {p.time}
                </Text>
              </View>
            </View>
            <Text
              className="text-text-secondary text-[14px] font-regular leading-[21px] mt-3"
              style={{ textAlign: textStart }}
            >
              {p.text}
            </Text>
            <View className="flex-row gap-5 mt-3">
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="favorite-border" size={15} color={green.textDim} />
                <Text className="text-text-dim text-[13px] font-regular">{s.likesN(p.likes)}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="chat-bubble-outline" size={14} color={green.textDim} />
                <Text className="text-text-dim text-[13px] font-regular">{s.repliesN(p.replies)}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
