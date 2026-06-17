/**
 * Bottom tab navigator — ported from NavScaffold's NavigationBar.
 * Order + icons match Flutter: Today / Calendar / Progress / Settings.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useStrings } from "@/i18n/useStrings";
import { colors } from "@/theme";

export default function TabsLayout() {
  const s = useStrings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.bg },
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
          title: s.calendar,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-month" color={color} size={size} />
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
