// src/lib/content/frontmatter.ts
import type { ContentMeta } from "./types";

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
    return typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
    return Array.isArray(v) && v.every(isString);
}

function optionalString(obj: Record<string, unknown>, key: string): string | undefined {
    const v = obj[key];
    return isString(v) ? v : undefined;
}

function optionalStringArray(obj: Record<string, unknown>, key: string): string[] | undefined {
    const v = obj[key];
    return isStringArray(v) ? v : undefined;
}

export function parseFrontMatter(data: unknown): ContentMeta {
    if (!isRecord(data)) {
        throw new Error("Invalid front-matter: expected an object");
    }

    const title = optionalString(data, "title");
    const summary = optionalString(data, "summary");

    if (!title) throw new Error('Front-matter missing required field: "title"');
    if (!summary) throw new Error('Front-matter missing required field: "summary"');

    return {
        title,
        summary,
        date: optionalString(data, "date"),
        tags: optionalStringArray(data, "tags"),
        cover: optionalString(data, "cover"),
    };
}
