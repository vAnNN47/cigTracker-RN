/**
 * Shared top bar for every tab: burger (opens the main drawer, on the reading
 * START edge) + optional centered title + avatar (opens the account drawer, on
 * the reading END edge). Rendered on all tabs so both drawers are reachable
 * everywhere — and because the icons sit on the start/end edges, the drawers
 * open from the correct side in both Hebrew (RTL) and English (LTR).
 */
import { MaterialIcons } from "@expo/vector-icons";

import { useStrings } from "@/i18n/useStrings";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

/** Shared tab top bar: burger (main drawer) + optional title + avatar (account drawer). */
export function TabHeader({ title }: { title?: string }) {
  const s = useStrings();
  const green = useColors();
  const showDrawer = useDrawerStore((st) => st.show);

  return (
    <View className="flex-row justify-between items-center px-[22px] py-1">
      <Pressable onPress={() => showDrawer("main")} hitSlop={8} className="w-10 h-10 items-center justify-center" accessibilityRole="button" accessibilityLabel={s.a11yOpenMenu}>
        <MaterialIcons name="menu" size={26} color={green.green} />
      </Pressable>
      {title ? (
        <Text className="flex-1 text-text text-[16px] font-semibold text-center">{title}</Text>
      ) : (
        <View className="flex-1" />
      )}
      <Pressable onPress={() => showDrawer("account")} hitSlop={8} className="w-10 h-10 items-center justify-center" accessibilityRole="button" accessibilityLabel={s.a11yOpenAccount}>
        <MaterialIcons name="account-circle" size={28} color={green.green} />
      </Pressable>
    </View>
  );
}
