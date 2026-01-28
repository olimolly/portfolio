import type { Metadata } from "next";
import { parseLang, SUPPORTED_LANGS, type Lang } from "@/lib/lang";
import { getUi } from "@/i18n/getUi";
import { ExternalButtonLink } from "@/components/ExternalButtonLink";

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

    const linkedin = "https://www.linkedin.com/in/olivier-morelle-673655194/";

    return (
        <main className="container-page">
            <section className="card">
                <h1 className="text-4xl font-semibold tracking-tight">
                    {ui.contact.headline}
                </h1>

                <div className="mt-8 flex gap-3 items-baseline">

                    <p className="mt-4 text-lg leading-relaxed text-muted">
                        {ui.contact.text}
                    </p>

                    <ExternalButtonLink
                        href={linkedin}
                        label={ui.contact.linkedinLabel}
                    />

                </div>
            </section>

        </main>

    );
}
