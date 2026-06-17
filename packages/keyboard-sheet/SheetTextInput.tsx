/**
 * A TextInput for use inside <KeyboardSheet>. Solves the tap-vs-drag / keyboard
 * flash conflict deterministically (no gorhom, no flaky gesture relations):
 *
 *  - WHILE UNFOCUSED: a transparent overlay covers the field so the native
 *    TextInput never receives the touch (can't self-focus mid-drag). The overlay
 *    carries a Tap with a tight maxDistance: a real tap focuses the field; any
 *    drag exceeds maxDistance so the Tap FAILS and the touch falls through to the
 *    sheet's Pan -> drag dismiss, no keyboard flash.
 *  - WHILE FOCUSED: overlay is gone; the field's native gesture is SIMULTANEOUS
 *    with the sheet Pan so you can drag-to-dismiss while editing.
 */
import { forwardRef, useCallback, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

import { SheetDragContext } from "./sheetDragContext";

export const SheetTextInput = forwardRef<TextInput, TextInputProps>(
  function SheetTextInput(props, ref) {
    const pan = useContext(SheetDragContext);
    const innerRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => innerRef.current as TextInput);

    const [focused, setFocused] = useState(false);
    const focusInput = useCallback(() => innerRef.current?.focus(), []);

    const nativeGesture = useMemo(() => {
      const g = Gesture.Native();
      return pan ? g.simultaneousWithExternalGesture(pan) : g;
    }, [pan]);

    const tapGesture = useMemo(
      () =>
        Gesture.Tap()
          .maxDistance(10) // a drag > 10px fails this Tap -> falls through to Pan
          .onEnd(() => {
            scheduleOnRN(focusInput);
          }),
      [focusInput],
    );

    // Derive the handler type from props so it matches whatever this RN version
    // defines (RN 0.85 switched these to FocusEvent/BlurEvent).
    const onFocus: TextInputProps["onFocus"] = (e) => {
      setFocused(true);
      props.onFocus?.(e);
    };
    const onBlur: TextInputProps["onBlur"] = (e) => {
      setFocused(false);
      props.onBlur?.(e);
    };

    return (
      <View>
        <GestureDetector gesture={nativeGesture}>
          <TextInput ref={innerRef} {...props} onFocus={onFocus} onBlur={onBlur} />
        </GestureDetector>
        {!focused && (
          <GestureDetector gesture={tapGesture}>
            <View style={StyleSheet.absoluteFill} />
          </GestureDetector>
        )}
      </View>
    );
  },
);
