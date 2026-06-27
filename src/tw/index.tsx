/**
 * CSS-enabled component wrappers (NativeWind v5 / react-native-css).
 *
 * react-native-css needs each element explicitly wrapped with `useCssElement`
 * for a `className` prop to resolve to styles, so the app imports View/Text/etc.
 * from here instead of straight from react-native. Tokens come from
 * `src/global.css` (ported from `src/theme`).
 */
import { Link as RouterLink } from "expo-router";
import React from "react";
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
} from "react-native";
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

export { ColorSchemeBridge } from "./ColorSchemeBridge";

/**
 * Minimal component shape handed to `useCssElement` for the big components
 * (Link/ScrollView/Image). Their full prop types make `useCssElement`'s `const`
 * generic inference blow up (TS2590 "union too complex"); narrowing C here keeps
 * the wrappers' public prop types precise while taming the inference.
 */
type Styleable = React.ComponentType<{ style?: unknown; contentContainerStyle?: unknown }>;

/** Read a CSS theme variable (e.g. "--color-bg") as a usable value in JS. */
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

/** expo-router Link with `className` support. */
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string },
) => useCssElement(RouterLink as unknown as Styleable, props, { className: "style" });
Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

/** `View` with `className` support. */
export type ViewProps = React.ComponentProps<typeof RNView> & { className?: string };
export const View = (props: ViewProps) => useCssElement(RNView, props, { className: "style" });
View.displayName = "CSS(View)";

/** `Text` with `className` support. */
export const Text = (props: React.ComponentProps<typeof RNText> & { className?: string }) =>
  useCssElement(RNText, props, { className: "style" });
Text.displayName = "CSS(Text)";

/** `ScrollView` with `className` + `contentContainerClassName` support. */
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) =>
  useCssElement(RNScrollView as unknown as Styleable, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
ScrollView.displayName = "CSS(ScrollView)";

/** `Pressable` with `className` support. */
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => useCssElement(RNPressable as unknown as Styleable, props, { className: "style" });
Pressable.displayName = "CSS(Pressable)";

/** `TextInput` with `className` support. */
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => useCssElement(RNTextInput as unknown as Styleable, props, { className: "style" });
TextInput.displayName = "CSS(TextInput)";
