import type { Lang } from "@/lib/lang";
import { UiMessages } from "./ui.types";

// mapping langue → loader
const UI_LOADERS: Record<Lang, () => Promise<UiMessages>> = {
    en: () => import("./en/ui.json").then((m) => m.default),
    fr: () => import("./fr/ui.json").then((m) => m.default),
};

export async function getUi(lang: Lang): Promise<UiMessages> {
    return UI_LOADERS[lang]();
}
