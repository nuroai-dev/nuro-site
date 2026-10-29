import { createContext, useContext, type ReactNode } from "react";
import { copy as birth } from "@/components/brand/birth/i18n";
import { copy as waitlist } from "@/components/brand/waitlist/i18n";
import type { Lang } from "@/i18n/ui";
const Language = createContext<Lang>("en");
const dictionaries = {
  en: { ...birth.en, ...waitlist.en },
  sv: { ...birth.sv, ...waitlist.sv },
};
export function SiteLanguage({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  return <Language.Provider value={lang}>{children}</Language.Provider>;
}
export function useTranslation() {
  const language = useContext(Language);
  const t = (key: string, values?: Record<string, string | number>): string => {
    let value: unknown = dictionaries[language];
    for (const part of key.split("."))
      value = (value as Record<string, unknown>)?.[part];
    return typeof value === "string"
      ? value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
          String(values?.[name] ?? ""),
        )
      : key;
  };
  return { t, i18n: { language } };
}
