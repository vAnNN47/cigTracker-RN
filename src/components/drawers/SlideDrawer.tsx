/**
 * App wrapper over the app-agnostic `packages/slide-drawer`: injects theme colors
 * (panel = bg, themed scrim) so screens don't pass colors. Supports expand-in-place
 * via `expanded` + `expandedContent` — see the package README.
 */
import {
  SlideDrawer as BaseSlideDrawer,
  type SlideDrawerProps as BaseSlideDrawerProps,
} from "../../../packages/slide-drawer";
import { useColors } from "@/theme";

export type SlideDrawerProps = Omit<BaseSlideDrawerProps, "panelColor" | "scrimColor">;

/** Themed wrapper over the app-agnostic `packages/slide-drawer` (injects panel + scrim colors). */
export function SlideDrawer(props: SlideDrawerProps) {
  const green = useColors();
  return <BaseSlideDrawer panelColor={green.bg} scrimColor="rgba(9,29,46,0.45)" {...props} />;
}
