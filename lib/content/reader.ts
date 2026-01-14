// src/lib/content/reader.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import type { Lang } from "@/lib/lang";
import type { ContentDoc } from "./types";
import { parseFrontMatter } from "./frontmatter";

export type ContentSection = "projects" | "blog";

const ROOT = process.cwd();

function contentDir(lang: Lang, section: ContentSection): string {
    if (!lang) throw new Error("contentDir: lang is missing");
    if (!section) throw new Error("contentDir: section is missing");
    return path.join(ROOT, "content", lang, section);
}

function resolveFile(dir: string, slug: string): string {
    const mdx = path.join(dir, `${slug}.mdx`);
    const md = path.join(dir, `${slug}.md`);

    if (fs.existsSync(mdx)) return mdx;
    if (fs.existsSync(md)) return md;

    throw new Error(`Missing content file for slug "${slug}" in ${dir}`);
}

export function listSlugs(lang: Lang, section: ContentSection): string[] {
    const dir = contentDir(lang, section);
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getDoc(lang: Lang, section: ContentSection, slug: string): ContentDoc {
    const dir = contentDir(lang, section);
    const filePath = resolveFile(dir, slug);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    return { slug, meta: parseFrontMatter(data), body: content };
}

export function getAllDocs(lang: Lang, section: ContentSection): ContentDoc[] {
    return listSlugs(lang, section).map((slug) => getDoc(lang, section, slug));
}
