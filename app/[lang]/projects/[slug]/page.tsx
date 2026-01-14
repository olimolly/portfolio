// app/[lang]/projects/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import { SUPPORTED_LANGS, parseLang, type Lang } from "@/lib/lang";
import { listSlugs, getDoc } from "@/lib/content/reader";
import { mdxComponents } from "@/lib/content/mdx-components";

export function generateStaticParams() {
    return SUPPORTED_LANGS.flatMap((lang) =>
        listSlugs(lang, "projects").map((slug) => ({ lang, slug }))
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
    const { lang: rawLang, slug } = await params;
    const lang: Lang = parseLang(rawLang);
    if (!slug) notFound();

    const doc = getDoc(lang, "projects", slug);

    const title = doc.meta.title;
    const description = doc.meta.summary;
    const images = doc.meta.cover ? [{ url: doc.meta.cover }] : undefined;

    return {
        title,
        description,
        openGraph: { title, description, type: "article", images },
        twitter: { card: "summary_large_image", title, description, images },
    };
}

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang: rawLang, slug } = await params;
    const lang: Lang = parseLang(rawLang);
    if (!slug) notFound();

    const doc = getDoc(lang, "projects", slug);

    const { content } = await compileMDX({
        source: doc.body,
        options: {
            mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [] },
        },
        components: mdxComponents,
    });

    return (
        <main className="">

        </main>

    );
}
