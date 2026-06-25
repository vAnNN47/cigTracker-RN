/**
 * Bottom tab navigator — "haze" design.
 * Order + icons: Today (home) · Diary (list) · Stats (bar-chart) · Settings.
 * Active = periwinkle, inactive = faint; 21px icons, 10px medium labels.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { type ComponentProps } from "react";
import { Pressable } from "react-native";

import { useStrings } from "@/i18n/useStrings";
import { fonts, useColors } from "@/theme";

/** Bottom tab navigator: Today · Diary · Community · Stats. */
export default function TabsLayout() {
  const s = useStrings();
  const green = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Active = vivid bright green so it clearly stands out from the muted
        // inactive tint (the old deep-green active read too close to inactive).
        tabBarActiveTintColor: green.greenBright,
        tabBarInactiveTintColor: green.textDim,
        tabBarLabelStyle: { fontSize: 10, fontFamily: fonts.medium },
        tabBarStyle: {
          backgroundColor: green.bg,
          borderTopColor: green.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: { backgroundColor: green.bg },
        // Contained press feedback — the default Android ripple fills the whole
        // tab slot; this keeps it a subtle circle behind the icon.
        tabBarButton: (props) => (
          <Pressable
            {...(props as ComponentProps<typeof Pressable>)}
            android_ripple={{ color: "rgba(46,204,113,0.18)", borderless: true, radius: 28 }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: s.today,
          tabBarIcon: ({ color }) => <MaterialIcons name="home-filled" color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: s.diaryTab,
          tabBarIcon: ({ color }) => <MaterialIcons name="list" color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: s.community,
          tabBarIcon: ({ color }) => <MaterialIcons name="forum" color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: s.progress,
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" color={color} size={21} />,
        }}
      />
    </Tabs>
  );
}
