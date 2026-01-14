// src/lib/content/types.ts
export type ContentMeta = {
    title: string;
    summary: string;
    date?: string;      // ISO "2026-01-07"
    tags?: string[];
    cover?: string;     // "/images/..."
};

export type ContentDoc = {
    slug: string;
    meta: ContentMeta;
    body: string;
};
