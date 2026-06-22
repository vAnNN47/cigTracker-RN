/**
 * Simple in-app document page (FAQ / Privacy policy / Terms). Placeholder lorem
 * content for now — swap in real copy later.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { textStart } from "@/i18n/rtl";
import { fonts, green, spacing } from "@/theme";

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

export function DocPage({ title }: { title: string }) {
  const router = useRouter();
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name={backIcon} size={26} color={green.text} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
        <Text style={styles.body}>{LOREM}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { color: green.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
  body: { color: green.textSecondary, fontSize: 15, fontFamily: fonts.regular, lineHeight: 24, textAlign: textStart },
});
