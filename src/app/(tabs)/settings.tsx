import { Text, View, StyleSheet } from "react-native";

import { useStrings } from "@/i18n/useStrings";
import { colors } from "@/theme";

export default function SettingsScreen() {
  const s = useStrings();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{s.settings}</Text>
      <Text style={styles.dim}>Coming next</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: 6 },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  dim: { color: colors.textDim },
});
