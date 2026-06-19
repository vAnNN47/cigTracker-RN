/**
 * Bottom tab navigator — ported from NavScaffold's NavigationBar.
 * Order + icons match Flutter: Today / Calendar / Progress / Settings.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

import { useStrings } from "@/i18n/useStrings";
import { colors } from "@/theme";

// Small, contained press feedback (the default Android ripple fills the whole
// tab slot — this keeps it a subtle circle behind the icon, Flutter-like).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabButton(props: any) {
  return (
    <Pressable
      {...props}
      android_ripple={{ color: colors.accentSoft, borderless: true, radius: 28 }}
    />
  );
}

export default function TabsLayout() {
  const s = useStrings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarButton: (props) => <TabButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: s.today,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="today" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: s.diaryTab,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu-book" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: s.progress,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="show-chart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: s.settings,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
