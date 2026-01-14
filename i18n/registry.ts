import type { Lang } from "@/lib/lang";

export function createLangRegistry<T>(
    map: Record<Lang, () => Promise<T>>
) {
    return {
        get(lang: Lang) {
            return map[lang]();
        },
    };
}
