/**
 * A TextInput for use inside <BottomSheet>, solving the tap-vs-drag / keyboard
 * flash conflict without gorhom and without the flaky requireExternalGestureToFail.
 *
 *  - WHILE UNFOCUSED: a transparent overlay covers the field so the native
 *    TextInput never receives the touch (so it can't self-focus mid-drag). The
 *    overlay carries a gesture-handler Tap with a tight maxDistance: a real tap
 *    (tiny movement) focuses the field; any drag exceeds maxDistance so the Tap
 *    FAILS on its own and the touch falls through to the sheet's Pan → drag
 *    dismiss, no keyboard flash. Deterministic by distance, all RNGH (no
 *    Pressable race).
 *  - WHILE FOCUSED: overlay is gone; the field's native gesture is SIMULTANEOUS
 *    with the sheet Pan so you can drag-to-dismiss while editing.
 */
import { forwardRef, useCallback, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

import { SheetDragContext } from "./sheetDragContext";

export const SheetTextInput = forwardRef<TextInput, TextInputProps>(
  function SheetTextInput(props, ref) {
    const pan = useContext(SheetDragContext);
    const innerRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => innerRef.current as TextInput);

    const [focused, setFocused] = useState(false);
    const focusInput = useCallback(() => innerRef.current?.focus(), []);

    // Editing-time gesture: let the sheet Pan win while the field is focused.
    const nativeGesture = useMemo(() => {
      const g = Gesture.Native();
      return pan ? g.simultaneousWithExternalGesture(pan) : g;
    }, [pan]);

    // Unfocused overlay gesture: focus ONLY on a real tap (small movement).
    const tapGesture = useMemo(
      () =>
        Gesture.Tap()
          .maxDistance(10) // a drag > 10px fails this Tap -> falls through to Pan
          .onEnd(() => {
            runOnJS(focusInput)();
          }),
      [focusInput],
    );

    const onFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setFocused(true);
      props.onFocus?.(e);
    };
    const onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
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
