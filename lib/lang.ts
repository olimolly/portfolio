// src/lib/lang.ts
export type Lang = "en" | "fr";

export const SUPPORTED_LANGS = ["en", "fr"] as const;
export const DEFAULT_LANG: Lang = "en";

export function parseLang(raw?: string): Lang {
    return SUPPORTED_LANGS.includes(raw as Lang) ? (raw as Lang) : DEFAULT_LANG;
}
