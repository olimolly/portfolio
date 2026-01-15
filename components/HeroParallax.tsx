"use client";

import { withBasePath } from "@/lib/withBasePath";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type ParallaxProject = {
    title: string;
    href: string;
    logoSrc: string;
};

export default function HeroParallax({
    projects,
}: {
    projects: ParallaxProject[];
}) {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const vh = window.innerHeight;

            // 0 → 1 pendant que la section traverse l’écran
            const p = 1 - rect.top / vh;
            setProgress(Math.min(Math.max(p, 0), 1));
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Déplacements BEAUCOUP plus visibles
    const x1 = -progress * 600;
    const x2 = progress * 900;

    return (
        <section ref={sectionRef} className="relative h-[200vh]">
            {/* Sticky viewport */}
            <div className="sticky top-0 flex h-screen items-center">
                <div className="w-full rounded-3xl border border-border bg-card p-6 overflow-hidden">
                    <h2 className="text-xl font-semibold">Featured projects</h2>
                    <p className="mt-1 text-muted">
                        Scroll to reveal. Projects move at different speeds.
                    </p>

                    <div className="mt-6 space-y-6">
                        {/* Track 1 */}
                        <div
                            className="flex gap-4 will-change-transform"
                            style={{ transform: `translate3d(${x1}px,0,0)` }}
                        >
                            {projects.concat(projects).map((p, i) => (
                                <Card key={`t1-${i}`} p={p} />
                            ))}
                        </div>

                        {/* Track 2 */}
                        <div
                            className="flex gap-4 will-change-transform"
                            style={{ transform: `translate3d(${x2}px,0,0)` }}
                        >
                            {projects
                                .slice()
                                .reverse()
                                .concat(projects.slice().reverse())
                                .map((p, i) => (
                                    <Card key={`t2-${i}`} p={p} />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Card({ p }: { p: ParallaxProject }) {
    return (
        <a
            href={p.href}
            className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 hover:opacity-90"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
                <Image src={withBasePath(p.logoSrc)} alt={p.title} width={28} height={28} />
            </div>
            <div>
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-muted">Open</div>
            </div>
        </a>
    );
}
