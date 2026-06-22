/**
 * Main drawer (≈75%, opens from the burger). Holds Community + Settings.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SlideDrawer } from "@/components/SlideDrawer";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useDrawerStore } from "@/store/useDrawerStore";
import { fonts, green, spacing } from "@/theme";

const COMMUNITY_URL = "https://example.com/community"; // dummy for now

export function MainDrawer() {
  const s = useStrings();
  const router = useRouter();
  const open = useDrawerStore((st) => st.open) === "main";
  const hide = useDrawerStore((st) => st.hide);

  return (
    <SlideDrawer open={open} forceSide="right" widthPct={0.76} onClose={hide}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Text style={styles.title}>{s.menu}</Text>
        <Row
          icon="groups"
          label={s.community}
          onPress={() => {
            hide();
            Linking.openURL(COMMUNITY_URL).catch(() => {});
          }}
        />
        <Row
          icon="settings"
          label={s.settings}
          onPress={() => {
            hide();
            router.push("/settings");
          }}
        />
      </SafeAreaView>
    </SlideDrawer>
  );
}

function Row({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  title: { color: green.green, fontSize: 22, fontFamily: fonts.bold, marginVertical: spacing.lg, textAlign: textStart },
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
});
