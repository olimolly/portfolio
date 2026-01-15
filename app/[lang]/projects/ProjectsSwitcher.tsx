// app/[lang]/projects/ProjectsSwitcher.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Doc = {
    slug: string;
    meta: {
        title: string;
        summary?: string;
        date?: string;
        tags?: string[];
    };
};

export default function ProjectsSwitcher({
    lang,
    ui,
    projects,
    experiences,
}: {
    lang: string;
    ui: { projectsLabel: string; experiencesLabel: string };
    projects: Doc[];
    experiences: Doc[];
}) {
    const [mode, setMode] = useState<"projects" | "experiences">("projects");

    const docs = useMemo(
        () => (mode === "projects" ? projects : experiences),
        [mode, projects, experiences]
    );

    return (
        <>
            {/* <h1 className="text-4xl font-semibold tracking-tight text-white">
                {ui.projectsLabel}
            </h1> */}

            {/* Toggle */}
            <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                <button
                    type="button"
                    onClick={() => setMode("projects")}
                    className={[
                        "rounded-full px-3 py-1.5 text-sm transition",
                        mode === "projects"
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:text-white",
                    ].join(" ")}
                >
                    {ui.projectsLabel}
                </button>

                <button
                    type="button"
                    onClick={() => setMode("experiences")}
                    className={[
                        "rounded-full px-3 py-1.5 text-sm transition",
                        mode === "experiences"
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:text-white",
                    ].join(" ")}
                >
                    {ui.experiencesLabel}
                </button>
            </div>

            {/* List */}
            <ul className="mt-8 space-y-6">
                {docs.map((doc) => (
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

                        {doc.meta.summary ? (
                            <p className="mt-2 text-slate-200">{doc.meta.summary}</p>
                        ) : null}

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
        </>
    );
}
