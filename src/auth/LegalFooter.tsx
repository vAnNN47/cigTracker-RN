/**
 * Sign-up legal footer: "By signing up you agree to our Privacy Policy and
 * Terms of Service". The links open the document INSIDE a self-contained modal
 * overlay (read-only) — they never navigate into the app, so a signed-out user
 * can read the policy without slipping past the auth gate (task 12).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { fonts, makeUseStyles, radius, spacing, useColors } from "@/theme";

// Placeholder policy copy until the real documents are wired in.
const DOC =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

export function LegalFooter() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const [doc, setDoc] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <Text style={styles.footer}>
        {s.agreePrefix}{" "}
        <Text style={styles.link} onPress={() => setDoc("privacy")}>
          {s.privacyPolicy}
        </Text>{" "}
        {s.agreeAnd}
        <Text style={styles.link} onPress={() => setDoc("terms")}>
          {s.termsOfService}
        </Text>
        .
      </Text>

      <Modal visible={doc !== null} animationType="slide" onRequestClose={() => setDoc(null)} transparent={false}>
        <SafeAreaView style={styles.docSafe} edges={["top", "bottom"]}>
          <View style={styles.docHeader}>
            <Text style={styles.docTitle}>{doc === "privacy" ? s.privacyPolicy : s.termsOfService}</Text>
            <Pressable onPress={() => setDoc(null)} hitSlop={10} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={green.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.docBody}>
            <Text style={styles.docText}>{DOC}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    footer: {
      color: green.textDim,
      fontSize: 12,
      fontFamily: fonts.regular,
      textAlign: "center",
      lineHeight: 18,
      marginTop: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
    link: { color: green.green, fontFamily: fonts.semibold },

    docSafe: { flex: 1, backgroundColor: green.bg },
    docHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: green.border,
    },
    docTitle: { color: green.text, fontSize: 18, fontFamily: fonts.bold, flex: 1, textAlign: textStart },
    closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: green.cardSoft },
    docBody: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, paddingBottom: spacing.xxl },
    docText: { color: green.textSecondary, fontSize: 15, fontFamily: fonts.regular, lineHeight: 24, textAlign: textStart },
  }),
);
