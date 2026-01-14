// app/[lang]/projects/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

import { SUPPORTED_LANGS, parseLang, type Lang } from "@/lib/lang";
import { getAllDocs } from "@/lib/content/reader";
import { getUi } from "@/i18n/getUi";

export function generateStaticParams() {
    return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang: rawLang } = await params;
    const lang: Lang = parseLang(rawLang);
    const ui = await getUi(lang);

    return {
        title: ui.nav.projects,
        description: ui?.projects?.listDescription ?? "Selected projects and case studies.",
    };
}

export default async function ProjectsPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang: rawLang } = await params;
    const lang: Lang = parseLang(rawLang);

    const ui = await getUi(lang);
    const docs = getAllDocs(lang, "projects");

    // option: tri par date desc si date existe
    const sorted = [...docs].sort((a, b) => {
        const ad = a.meta.date ? Date.parse(a.meta.date) : 0;
        const bd = b.meta.date ? Date.parse(b.meta.date) : 0;
        return bd - ad;
    });

    return (
        <main className="mx-auto w-full max-w-3xl px-6 py-12">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
                {ui.nav.projects}
            </h1>

            <ul className="mt-8 space-y-6">
                {sorted.map((doc) => (
                    <li
                        key={doc.slug}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/8"
                    >
                        <Link
                            href={`/${lang}/projects/${doc.slug}`}
                            className="text-xl font-semibold text-white hover:underline underline-offset-4"
                        >
                            {doc.meta.title}
                        </Link>

                        <p className="mt-2 text-slate-200">
                            {doc.meta.summary}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                            {doc.meta.date ? (
                                <span>
                                    {new Date(doc.meta.date).toLocaleDateString(lang)}
                                </span>
                            ) : null}

                            {doc.meta.tags?.length ? (
                                <span className="flex flex-wrap gap-2">
                                    {doc.meta.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-300"
                                        >
                                            #{t}
                                        </span>
                                    ))}
                                </span>
                            ) : null}
                        </div>
                    </li>
                ))}
            </ul>
        </main>

    );
}
