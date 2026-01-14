import type { Metadata } from "next";
import { parseLang, SUPPORTED_LANGS, type Lang } from "@/lib/lang";
import { getUi } from "@/i18n/getUi";
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
        title: ui.contact.title,
        description: ui.contact.description,
    };
}

export default async function ContactPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang: rawLang } = await params;
    const lang: Lang = parseLang(rawLang);
    const ui = await getUi(lang);

    // const email = "mailto:your@email.com";
    const linkedin = "https://www.linkedin.com/in/olivier-morelle-673655194/";
    const github = "https://github.com/";
    // const cv = `/${lang}/cv/`; //

    return (
        <main className="container-page">
            <section className="card">
                <h1 className="text-4xl font-semibold tracking-tight">
                    {ui.contact.headline}
                </h1>

                <p className="mt-4 text-lg leading-relaxed text-muted">
                    {ui.contact.text}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    {/* <a className="btn btn-primary" href={email}>
        {ui.contact.emailLabel}
      </a> */}

                    <a
                        className="btn btn-ghost"
                        href={linkedin}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {ui.contact.linkedinLabel}
                    </a>

                    {/* <a
        className="btn btn-ghost"
        href={github}
        target="_blank"
        rel="noreferrer"
      >
        {ui.contact.githubLabel}
      </a> */}

                    {/* <a className="btn btn-ghost" href={cv}>
        {ui.contact.cvLabel}
      </a> */}
                </div>
            </section>

            <section className="mt-6 card-sm">
                <h2 className="text-lg font-semibold">{ui.nav.projects}</h2>
                <p className="mt-2 text-muted">{ui.nav.seeProjects}</p>

                <div className="mt-4">
                    <Link className="btn btn-ghost" href={`/${lang}/projects/`}>
                        {ui.nav.projects}
                    </Link>
                </div>
            </section>
        </main>

    );
}
