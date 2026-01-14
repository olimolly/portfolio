import type { Lang } from "@/lib/lang";

export function switchLangPath(
    pathname: string,
    targetLang: Lang
): string {
    if (!pathname) return `/${targetLang}/`;

    const segments = pathname.split("/").filter(Boolean);

    // si on n'a pas de segment ("/")
    if (segments.length === 0) {
        return `/${targetLang}/`;
    }

    // remplace le premier segment (lang)
    segments[0] = targetLang;

    return "/" + segments.join("/") + "/";
}
