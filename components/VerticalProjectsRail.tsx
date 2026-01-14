"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type VerticalProject = {
    slug: string;
    title: string;
    summary: string;
    logoSrc: string;
    href: string;
    tags?: string[];
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function getHalo(activeIndex: number, progress: number, reduceMotion: boolean) {
    const yAnchors = [28, 40, 55, 66, 34];
    const y = yAnchors[activeIndex % yAnchors.length];
    const x = reduceMotion ? 50 : 12 + clamp(progress, 0, 1) * 76; // 12%..88%
    return { x, y };
}

export default function VerticalProjectsRail({ projects }: { projects: VerticalProject[] }) {
    const sceneRefs = useRef<Array<HTMLElement | null>>([]);
    const safeProjects = projects ?? [];
    const hasProjects = safeProjects.length > 0;

    const [activeIndex, setActiveIndex] = useState(0);
    const [activeProgress, setActiveProgress] = useState(0); // vérité UI

    // halo retardé
    const [haloProgress, setHaloProgress] = useState(0);

    const reduceMotion = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
    }, []);

    // cible à suivre (mise à jour au scroll)
    const targetProgressRef = useRef(0);
    const targetIndexRef = useRef(0);

    // vitesse scroll px/s
    const lastScrollYRef = useRef<number>(0);
    const lastScrollTsRef = useRef<number>(0);

    /**
     * Scroll handler:
     * - calcule activeIndex + activeProgress
     * - met à jour targetProgressRef
     * - si scroll trop rapide => snap haloProgress (pas d’anim)
     *
     * IMPORTANT: cet effet ne dépend PAS de haloProgress (sinon boucle).
     */
    useEffect(() => {
        if (!hasProjects) return;

        let raf = 0;

        const compute = () => {
            const vh = window.innerHeight;

            // vitesse scroll (px/s)
            const now = performance.now();
            const y = window.scrollY;

            const prevY = lastScrollYRef.current || y;
            const prevTs = lastScrollTsRef.current || now;

            const dt = Math.max(1, now - prevTs);
            const pxPerSec = Math.abs(y - prevY) / (dt / 1000);

            lastScrollYRef.current = y;
            lastScrollTsRef.current = now;

            // scène active
            let bestIdx = 0;
            let bestDist = Number.POSITIVE_INFINITY;

            for (let i = 0; i < safeProjects.length; i++) {
                const el = sceneRefs.current[i];
                if (!el) continue;

                const r = el.getBoundingClientRect();
                const center = r.top + r.height / 2;
                const dist = Math.abs(center - vh / 2);

                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }

            bestIdx = clamp(bestIdx, 0, safeProjects.length - 1);

            // progress dans la scène
            let p = 0;
            const el = sceneRefs.current[bestIdx];
            if (el) {
                const r = el.getBoundingClientRect();
                const total = r.height - vh;
                const scrolled = -r.top;
                p = total <= 0 ? 0 : scrolled / total;
                p = clamp(p, 0, 1);
            }

            setActiveIndex(bestIdx);
            setActiveProgress(p);

            // update target
            const prevIdx = targetIndexRef.current;
            targetIndexRef.current = bestIdx;
            targetProgressRef.current = p;

            // changement de scène => snap
            if (bestIdx !== prevIdx) {
                setHaloProgress(p);
                return;
            }

            // scroll trop rapide => snap (pas d’anim)
            const FAST_SCROLL_PX_PER_SEC = 2600;
            if (pxPerSec > FAST_SCROLL_PX_PER_SEC) {
                setHaloProgress(p);
            }
        };

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                compute();
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        compute();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [hasProjects, safeProjects.length]);

    /**
     * Lissage continu vers la cible (retard 2–3s).
     */
    useEffect(() => {
        if (!hasProjects) return;

        if (reduceMotion) {
            setHaloProgress(targetProgressRef.current);
            return;
        }

        let rafId = 0;
        let lastTs = performance.now();

        const TAU_MS = 2500;

        const tick = (now: number) => {
            const dt = Math.min(64, now - lastTs);
            lastTs = now;

            const target = targetProgressRef.current;

            setHaloProgress((cur) => {
                const diff = target - cur;
                if (Math.abs(diff) < 0.0008) return target;

                const alpha = 1 - Math.exp(-dt / TAU_MS);
                return cur + diff * alpha;
            });

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [hasProjects, reduceMotion]);

    if (!hasProjects) return null;

    const active = safeProjects[clamp(activeIndex, 0, safeProjects.length - 1)];

    const halo = getHalo(activeIndex, haloProgress, reduceMotion);

    const haloPos = {
        left: `${halo.x}%`,
        top: `${halo.y}%`,
        transform: "translate(-50%, -50%)",
    } as const;

    // respiration basée sur haloProgress
    const t = clamp(haloProgress, 0, 1);
    const pulse = 1 - Math.abs(2 * t - 1);

    const coreSize = reduceMotion ? 160 : 140 + pulse * 70;
    const glowSize = reduceMotion ? 360 : 320 + pulse * 260;

    const coreOpacity = reduceMotion ? 0.22 : 0.18 + pulse * 0.18;
    const glowOpacity = reduceMotion ? 0.10 : 0.06 + pulse * 0.10;

    const progressPct = Math.round(activeProgress * 100);

    return (
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            {/* Left rail sticky */}
            <aside className="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md min-h-72">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <Image src={active.logoSrc} alt={active.title} width={34} height={34} />
                        </div>

                        <div className="min-w-0">
                            <div className="text-sm text-white/60">Selected project</div>
                            <div className="truncate text-lg font-semibold text-white">{active.title}</div>
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-white/70">{active.summary}</p>

                    {!!active.tags?.length && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {active.tags.slice(0, 6).map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-white/80"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* <div className="mt-6 flex gap-3">
                        <a
                            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                            href={active.href}
                        >
                            Open project
                        </a>
                        <a
                            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                            href={active.href}
                        >
                            Details
                        </a>
                    </div> */}

                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                            <span>Scene</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                            <div className="h-full bg-white" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right column */}
            <div className="relative isolate overflow-hidden">
                {/* Halo global (sous le contenu) */}
                <div className="pointer-events-none absolute inset-0 z-0">
                    <div
                        className="absolute rounded-full bg-white blur-lg"
                        style={{ ...haloPos, width: coreSize, height: coreSize, opacity: coreOpacity }}
                    />
                    <div
                        className="absolute rounded-full bg-white blur-3xl"
                        style={{ ...haloPos, width: glowSize, height: glowSize, opacity: glowOpacity }}
                    />
                </div>

                {/* Scenes */}
                <div className="relative z-10">
                    {safeProjects.map((p, i) => (
                        <section
                            key={p.slug}
                            ref={(el) => {
                                sceneRefs.current[i] = el;
                            }}
                            className="relative h-[142vh]"
                        >
                            <div className="sticky top-0 flex h-screen items-center p-6">
                                <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 p-8 min-h-72">
                                    {/* Halo local */}
                                    <div className="pointer-events-none absolute inset-0 z-0">
                                        <div
                                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-sm"
                                            style={{
                                                left: `${halo.x}%`,
                                                top: `${halo.y}%`, // ✅ top
                                                width: coreSize * 0.7,
                                                height: coreSize * 0.7,
                                                opacity: Math.min(0.5, coreOpacity + 0.1),
                                            }}
                                        />
                                        <div
                                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-2xl"
                                            style={{
                                                left: `${halo.x}%`,
                                                top: `${halo.y}%`, // ✅ top
                                                width: glowSize * 0.75,
                                                height: glowSize * 0.75,
                                                opacity: glowOpacity,
                                            }}
                                        />
                                    </div>

                                    {/* Glass layer */}
                                    <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-xs" />

                                    {/* Contenu */}
                                    <div className="relative z-20">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                                                <Image src={p.logoSrc} alt={p.title} width={28} height={28} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-3xl font-semibold tracking-tight text-white">
                                                    {p.title}
                                                </h3>
                                                <p className="mt-2 text-white/70">{p.summary}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <a
                                                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                                                href={p.href}
                                            >
                                                View project
                                            </a>
                                            <a
                                                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                                                href={p.href}
                                            >
                                                Read more
                                            </a>
                                        </div>

                                        <div className="mt-10 text-sm text-white/60">
                                            {i === activeIndex ? "Active scene." : "Scroll to reach this scene."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
