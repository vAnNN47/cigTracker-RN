/**
 * Shared top bar for every tab: burger (opens the main drawer, on the reading
 * START edge) + optional centered title + avatar (opens the account drawer, on
 * the reading END edge). Rendered on all tabs so both drawers are reachable
 * everywhere — and because the icons sit on the start/end edges, the drawers
 * open from the correct side in both Hebrew (RTL) and English (LTR).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useDrawerStore } from "@/store/useDrawerStore";
import { fonts, makeUseStyles, spacing, useColors } from "@/theme";

/** Shared tab top bar: burger (main drawer) + optional title + avatar (account drawer). */
export function TabHeader({ title }: { title?: string }) {
  const green = useColors();
  const styles = useStyles();
  const showDrawer = useDrawerStore((st) => st.show);

  return (
    <View style={styles.bar}>
      <Pressable onPress={() => showDrawer("main")} hitSlop={8} style={styles.icon}>
        <MaterialIcons name="menu" size={26} color={green.green} />
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : <View style={{ flex: 1 }} />}
      <Pressable onPress={() => showDrawer("account")} hitSlop={8} style={styles.icon}>
        <MaterialIcons name="account-circle" size={28} color={green.green} />
      </Pressable>
    </View>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 22,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
    },
    icon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, color: green.text, fontSize: 16, fontFamily: fonts.semibold, textAlign: "center" },
  }),
);
