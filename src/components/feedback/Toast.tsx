/**
 * Self-dismissing toast with an optional action. Exposed via a context so any
 * screen can call useToast().show({ message, actionLabel, onAction }).
 */
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { textStart } from "@/i18n/rtl";
import { useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextValue {
  show: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Access the toast API; throws if used outside a ToastProvider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

/** Provides the toast context and renders the self-dismissing toast overlay. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const green = useColors();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(12));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 12, duration: 150, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const show = (opts: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    // Screen readers don't notice a new view on their own — speak the message.
    // (announceForAccessibility covers both iOS + Android; the View's
    // accessibilityLiveRegion is the Android-native belt-and-suspenders.)
    AccessibilityInfo.announceForAccessibility(opts.message);
    setToast(opts);
    opacity.setValue(0);
    translateY.setValue(12);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(hide, opts.duration ?? 3000);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: insets.bottom + 92,
            opacity,
            transform: [{ translateY }],
          }}
        >
          <View
            accessibilityLiveRegion="polite"
            className="flex-row items-center bg-card border border-border rounded-input py-3 pl-4 pr-2"
            style={{
              shadowColor: green.shadow,
              shadowOpacity: 0.18,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <Text className="flex-1 text-text text-[15px] font-regular" style={{ textAlign: textStart }}>
              {toast.message}
            </Text>
            {toast.actionLabel && (
              <Pressable
                onPress={() => {
                  hide();
                  toast.onAction?.();
                }}
              >
                <Text className="text-green font-bold p-2">{toast.actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
