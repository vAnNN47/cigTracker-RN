/** expo-image with `className` support + web objectFit/objectPosition remapping. */
import { Image as RNImage } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { useCssElement } from "react-native-css";

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

function CSSImage(props: React.ComponentProps<typeof AnimatedExpoImage>) {
  // Remap web object-fit/position styles to expo-image's contentFit/contentPosition.
  // @ts-expect-error: objectFit/objectPosition aren't on RN style types.
  const { objectFit, objectPosition, ...style } = StyleSheet.flatten(props.style) || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...props}
      source={typeof props.source === "string" ? { uri: props.source } : props.source}
      // @ts-expect-error: style is remapped above.
      style={style}
    />
  );
}

// Narrow C so useCssElement's `const` generic inference doesn't blow up (TS2590).
type Styleable = React.ComponentType<{ style?: unknown }>;

export type ImageProps = React.ComponentProps<typeof CSSImage> & { className?: string };
export const Image = (props: ImageProps) =>
  useCssElement(CSSImage as unknown as Styleable, props, { className: "style" });
Image.displayName = "CSS(Image)";
