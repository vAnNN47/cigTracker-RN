import { colors, radius, spacing } from "@/theme";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { forwardRef, ReactNode, useImperativeHandle, useRef } from "react";
import { NativeSyntheticEvent, StyleSheet, View } from "react-native";
import { KeyboardController } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  children: ReactNode;
  onDismiss?: () => void;
}

const DRAG_DISMISS_THRESHOLD = 40;

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet({ children, onDismiss }, ref) {
    const sheetRef = useRef<TrueSheet>(null);
    const dragStartPositionRef = useRef<number | null>(null);
    const didTriggerDismissRef = useRef(false);
    const insets = useSafeAreaInsets();

    const handleDragBegin = (event: NativeSyntheticEvent<{ position: number }>) => {
      dragStartPositionRef.current = event.nativeEvent.position;
      didTriggerDismissRef.current = false;
    };

    const handleDragChange = (event: NativeSyntheticEvent<{ position: number }>) => {
      const currentPosition = event.nativeEvent.position;
      const startPosition = dragStartPositionRef.current;

      if (
        startPosition !== null &&
        !didTriggerDismissRef.current &&
        currentPosition > startPosition + DRAG_DISMISS_THRESHOLD
      ) {
        didTriggerDismissRef.current = true;
        KeyboardController.dismiss();
        sheetRef.current?.dismiss();
      }
    };

    const handleDragEnd = () => {
      dragStartPositionRef.current = null;
      didTriggerDismissRef.current = false;
    };

    useImperativeHandle(ref, () => ({
      present: () => {
        sheetRef.current?.present();
      },
      dismiss: () => {
        sheetRef.current?.dismiss();
      },
    }));

    return (
      <TrueSheet
        ref={sheetRef}
        detents={["auto"]}
        dismissible
        draggable
        backgroundColor={colors.surface}
        cornerRadius={radius.sheet}
        grabber
        onDragBegin={handleDragBegin}
        onDragChange={handleDragChange}
        onDragEnd={handleDragEnd}
        onWillDismiss={() => KeyboardController.dismiss()}
        onDidDismiss={onDismiss}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}> 
          {children}
        </View>
      </TrueSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});
