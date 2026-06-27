/**
 * Sign-up legal footer: "By signing up you agree to our Privacy Policy and
 * Terms of Service". The links open the document INSIDE a self-contained modal
 * overlay (read-only) — they never navigate into the app, so a signed-out user
 * can read the policy without slipping past the auth gate (task 12).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";

// Placeholder policy copy until the real documents are wired in.
const DOC =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

/** Sign-up legal footer; opens Privacy/Terms in a self-contained read-only modal. */
export function LegalFooter() {
  const s = useStrings();
  const green = useColors();
  const [doc, setDoc] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <Text
        className="text-text-dim text-[12px] font-regular text-center leading-[18px] mt-4 px-2"
      >
        {s.agreePrefix}{" "}
        <Text className="text-green font-semibold" onPress={() => setDoc("privacy")}>
          {s.privacyPolicy}
        </Text>{" "}
        {s.agreeAnd}
        <Text className="text-green font-semibold" onPress={() => setDoc("terms")}>
          {s.termsOfService}
        </Text>
        .
      </Text>

      <Modal visible={doc !== null} animationType="slide" onRequestClose={() => setDoc(null)} transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: green.bg }} edges={["top", "bottom"]}>
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
            <Text className="text-text text-[18px] font-bold flex-1" style={{ textAlign: textStart }}>
              {doc === "privacy" ? s.privacyPolicy : s.termsOfService}
            </Text>
            <Pressable onPress={() => setDoc(null)} hitSlop={10} className="w-9 h-9 items-center justify-center rounded-[18px] bg-card-soft">
              <MaterialIcons name="close" size={24} color={green.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="px-5 py-4 pb-6">
            <Text className="text-text-secondary text-[15px] font-regular leading-6" style={{ textAlign: textStart }}>
              {DOC}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
