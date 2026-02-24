// app/[lang]/layout.tsx
import Link from "next/link";
import type { Lang } from "@/lib/lang";
import { parseLang, SUPPORTED_LANGS } from "@/lib/lang";
import { getUi } from "@/i18n/getUi";
import { TranslationsProvider } from "@/lib/i18n/UiProvider";
import LangSwitch from "@/components/LangSwitch";

export function generateStaticParams() {
    return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang: rawLang } = await params;
    const lang: Lang = parseLang(rawLang);
    const ui = await getUi(lang);

    return (
        <TranslationsProvider value={ui}>
            <div className="min-h-screen p-6 bg-gradient-to-br from-[#050b14] via-[#0b1f3a] to-[#0b1f3a] text-slate-100 overflow-visible ">
                <header className="mb-6 flex items-center gap-4">
                    <nav className="flex items-center gap-3">
                        <Link
                            href={`/${lang}`}
                            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
                        >
                            {ui.nav.home}
                        </Link>

                        <Link
                            href={`/${lang}/projects`}
                            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
                        >
                            {ui.nav.projects}
                        </Link>

                        {/* <Link href={`/${lang}/blog`}>{ui.nav.blog}</Link> */}

                        <Link
                            href={`/${lang}/contact`}
                            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
                        >
                            {ui.nav.contact}
                        </Link>
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <LangSwitch />
                    </div>
                </header>

                {children}
            </div>

        </TranslationsProvider>
    );
}
