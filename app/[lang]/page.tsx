// app/[lang]/page.tsx
import type { Metadata } from "next";
import { parseLang, SUPPORTED_LANGS, type Lang } from "@/lib/lang";
import { getUi } from "@/i18n/getUi";
import VerticalProjectsRail from "@/components/VerticalProjectsRail";
import { vertical } from "@/content/dataFeatured";
import Link from "next/link";

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
        title: ui.home.title,
        description: ui.home.description,
    };
}

export default async function Home({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang: rawLang } = await params;
    const lang: Lang = parseLang(rawLang);
    const ui = await getUi(lang);

    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-16 min-h-[500px]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h1 className="text-4xl font-semibold tracking-tight text-white">
                    {ui.home.heroTitle}
                </h1>

                <h2 className="mt-4 text-lg leading-relaxed text-slate-200">
                    {ui.home.heroSubtitle}
                </h2>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href={`/${lang}/projects/`}
                        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                        {ui.nav.projects}
                    </Link>

                    <a
                        href="https://www.linkedin.com/in/olivier-morelle-673655194/"
                        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#050b14] hover:bg-white/90 transition-colors"
                    >
                        {ui.cta.hireMe}
                    </a>

                    {/*
            <Link
                href={`/${lang}/contact/`}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
                {ui.cta.contact}
            </Link>
            */}
                </div>
            </section>

            {/* <div className="mt-6">
        <HeroParallax projects={featured(lang)} />
    </div> */}

            <div className="mt-36">
                <VerticalProjectsRail projects={vertical(lang)} />
            </div>
        </main>

    );
}
