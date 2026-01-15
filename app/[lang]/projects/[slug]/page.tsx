// app/[lang]/projects/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import { compileMDX } from "next-mdx-remote/rsc";

import { SUPPORTED_LANGS, parseLang, type Lang } from "@/lib/lang";
import { listSlugs, getDoc } from "@/lib/content/reader";
import { mdxComponents } from "@/lib/content/mdx-components";
import { ExternalButtonLink } from "@/components/ExternalButtonLink";
import { withBasePath } from "@/lib/withBasePath";

/* -----------------------------
   Static params (export)
-------------------------------- */
export function generateStaticParams() {
    return SUPPORTED_LANGS.flatMap((lang) =>
        listSlugs(lang, "projects").map((slug) => ({
            lang,
            slug,
        }))
    );
}

/* -----------------------------
   Metadata (SEO)
-------------------------------- */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
    const { lang: rawLang, slug } = await params;
    const lang: Lang = parseLang(rawLang);

    if (!slug) notFound();

    const doc = getDoc(lang, "projects", slug);

    const title = doc.meta.title ?? slug;
    const description = doc.meta.summary ?? "";
    const images = doc.meta.cover ? [{ url: doc.meta.cover }] : undefined;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images,
        },
    };
}

/* -----------------------------
   Page
-------------------------------- */
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
            mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [],
            },
        },
        components: mdxComponents,
    });

    return (
        <main className="container-page">
            {/* Header */}
            <header className="mb-10">
                <p className="text-sm text-muted">
                    {doc.meta.date
                        ? new Date(doc.meta.date).toLocaleDateString(lang)
                        : null}

                    {doc.meta.tags?.length ? (
                        <span className="ml-3 inline-flex flex-wrap gap-2">
                            {doc.meta.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-border bg-card px-2 py-0.5 text-xs"
                                >
                                    {tag}
                                </span>
                            ))}
                        </span>
                    ) : null}
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                    {doc.meta.title}
                </h1>

                {doc.meta.summary ? (
                    <p className="mt-4 text-lg leading-relaxed text-muted">
                        {doc.meta.summary}
                    </p>
                ) : null}

                {doc.meta.cover ? (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-border">
                        <Image
                            src={withBasePath(doc.meta.cover)}
                            alt={doc.meta.title}
                            width={1200}
                            height={630}
                            className="h-auto w-full"
                            priority
                        />
                    </div>
                ) : null}
            </header>

            {/* MDX content */}
            <article className="prose prose-neutral max-w-none">
                {content}
            </article>

            {/* Footer CTA */}
            <footer className="mt-16 flex flex-wrap gap-3">
                <ExternalButtonLink
                    href={`/${lang}/projects/`}
                    label=" ← Back to projects"
                    className="btn btn-ghost"
                />
                <ExternalButtonLink
                    href={`/${lang}/contact/`}
                    label="Contact"
                    className="btn btn-primary"
                />

            </footer>
        </main>
    );
}
