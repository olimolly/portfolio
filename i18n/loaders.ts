import { createLangRegistry } from "./registry";
import type { UiMessages } from "./ui.types";
import type { Lang } from "@/lib/lang";

export const uiRegistry = createLangRegistry<UiMessages>({
    en: () => import("@/i18n/en/ui.json").then((m) => m.default),
    fr: () => import("@/i18n/fr/ui.json").then((m) => m.default),
});

export async function getUi(lang: Lang) {
    return uiRegistry.get(lang);
}
