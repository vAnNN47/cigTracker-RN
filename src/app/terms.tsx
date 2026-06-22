import { DocPage } from "@/components/DocPage";
import { useStrings } from "@/i18n/useStrings";

export default function TermsScreen() {
  const s = useStrings();
  return <DocPage title={s.termsOfService} />;
}
