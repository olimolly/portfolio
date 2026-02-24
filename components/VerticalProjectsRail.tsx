"use client";

import { withBasePath } from "@/lib/withBasePath";
import Image from "next/image";
import {
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type VerticalProject = {
    slug: string;
    title: string;
    summary: string;
    logoSrc: string;
    href: string;
    linkProject?: string;
    tags?: string[];
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

type Pt = { x: number; y: number };

function quadBezier(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
}

/**
 * - Progress cohérent (100% seulement après la dernière carte)
 * - Cartes plus "glass" / blur pour laisser le halo ressortir
 * - Mobile: pas de carte dynamique à gauche (inutile en responsive)
 */

const GAP_PX = 28;
const IO_ROOT_MARGIN = "-35% 0px -45% 0px";
const TAU_MS = 1400;

const CORE_MIN = 150;
const CORE_MAX = 240;
const GLOW_MIN = 340;
const GLOW_MAX = 560;

const ACTIVE_SWITCH_DELAY_MS = 140;
const ACTIVE_MIN_RATIO = 0.22;
const MANUAL_LOCK_MS = 900;

const CARD_CLASS = "rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]";
const CARD_CLASS_GLASS = `${CARD_CLASS} backdrop-blur-2xl`;

export default function VerticalProjectsRail({ projects }: { projects: VerticalProject[] }) {
    const safeProjects = projects ?? [];
    const hasProjects = safeProjects.length > 0;

    const reduceMotion = useMemo(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
    }, []);

    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const rightColRef = useRef<HTMLDivElement | null>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const deferredActiveIndex = useDeferredValue(activeIndex);

    const targetPosRef = useRef<Pt>({ x: 0, y: 0 });
    const [haloPos, setHaloPos] = useState<Pt>({ x: 0, y: 0 });

    const [scrollT, setScrollT] = useState(0);

    const switchTimerRef = useRef<number | null>(null);
    const candidateRef = useRef<{ idx: number; ratio: number } | null>(null);
    const manualLockUntilRef = useRef(0);
    const manualLockTimerRef = useRef<number | null>(null);

    // IO => propose un candidat, puis commit après un petit délai si stable
    useEffect(() => {
        if (!hasProjects) return;

        const els = itemRefs.current.filter(Boolean) as HTMLElement[];
        if (!els.length) return;

        const commitCandidate = () => {
            if (performance.now() < manualLockUntilRef.current) return;
            const c = candidateRef.current;
            if (!c) return;
            if (c.ratio < ACTIVE_MIN_RATIO) return;

            setActiveIndex((cur) => (cur === c.idx ? cur : c.idx));
        };

        const scheduleCommit = () => {
            if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
            switchTimerRef.current = window.setTimeout(commitCandidate, ACTIVE_SWITCH_DELAY_MS);
        };

        const io = new IntersectionObserver(
            (entries) => {
                let bestIdx = activeIndex;
                let bestRatio = 0;

                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    const idx = Number((e.target as HTMLElement).dataset.index ?? "0");
                    const ratio = e.intersectionRatio;

                    if (ratio > bestRatio) {
                        bestRatio = ratio;
                        bestIdx = idx;
                    }
                }

                if (bestRatio <= 0) return;

                const prev = candidateRef.current;
                const changed = !prev || prev.idx !== bestIdx;

                candidateRef.current = { idx: bestIdx, ratio: bestRatio };

                if (changed && bestIdx !== activeIndex) scheduleCommit();
            },
            {
                root: null,
                rootMargin: IO_ROOT_MARGIN,
                threshold: [0, 0.12, 0.2, 0.33, 0.5, 0.66, 0.85, 1],
            }
        );

        els.forEach((el) => io.observe(el));

        return () => {
            io.disconnect();
            if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
            switchTimerRef.current = null;
            candidateRef.current = null;

            if (manualLockTimerRef.current) window.clearTimeout(manualLockTimerRef.current);
            manualLockTimerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasProjects, safeProjects.length, activeIndex]);

    // Scroll => t (0..1) cohérent + trajectoire courbe
    useEffect(() => {
        if (!hasProjects) return;

        let raf = 0;

        const computeTargetFromScroll = () => {
            const wrap = rightColRef.current;
            if (!wrap) return;

            const vh = window.innerHeight;
            const rect = wrap.getBoundingClientRect();

            const topAbs = rect.top + window.scrollY;
            const bottomAbs = rect.bottom + window.scrollY;

            const centerAbs = window.scrollY + vh * 0.5;

            // 0% quand center = top + vh/2 ; 100% quand center = bottom - vh/2
            const start = topAbs + vh * 0.5;
            const end = bottomAbs - vh * 0.5;
            const denom = Math.max(1, end - start);

            const t = clamp((centerAbs - start) / denom, 0, 1);
            setScrollT(t);

            // points de la courbe (coords locales)
            const w = rect.width;
            const h = rect.height;

            const p0: Pt = { x: w * 0.18, y: h * 0.82 };
            const p1: Pt = { x: w * 0.50, y: h * 0.22 };
            const p2: Pt = { x: w * 0.82, y: h * 0.82 };

            targetPosRef.current = quadBezier(p0, p1, p2, t);
        };

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                computeTargetFromScroll();
            });
        };

        const onResize = () => {
            computeTargetFromScroll();
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });

        computeTargetFromScroll();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [hasProjects]);

    // Lissage halo
    useEffect(() => {
        if (!hasProjects) return;

        if (reduceMotion) {
            setHaloPos(targetPosRef.current);
            return;
        }

        let raf = 0;
        let lastTs = performance.now();

        const tick = (now: number) => {
            const dt = Math.min(64, now - lastTs);
            lastTs = now;

            const target = targetPosRef.current;

            setHaloPos((cur) => {
                const alpha = 1 - Math.exp(-dt / TAU_MS);
                return {
                    x: lerp(cur.x, target.x, alpha),
                    y: lerp(cur.y, target.y, alpha),
                };
            });

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [hasProjects, reduceMotion]);

    if (!hasProjects) return null;

    const active = safeProjects[clamp(deferredActiveIndex, 0, safeProjects.length - 1)];
    const total = safeProjects.length;

    // index affiché (celui qui drive la carte sticky)
    const idx = clamp(deferredActiveIndex, 0, Math.max(0, total - 1));

    // 1-based pour l’affichage (1 / N)
    const step = total ? idx + 1 : 0;

    // % en “steps” (0% si 0 item, 100% sur le dernier)
    const progressPct = total <= 1 ? 100 : Math.round((idx / (total - 1)) * 100);
    // const progressPct = Math.round(scrollT * 100);

    const pulse = 1 - Math.abs(2 * scrollT - 1);

    const coreSize = CORE_MIN + (CORE_MAX - CORE_MIN) * pulse;
    const glowSize = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * pulse;

    const coreOpacity = reduceMotion ? 0.18 : 0.14 + 0.10 * pulse;
    const glowOpacity = reduceMotion ? 0.08 : 0.05 + 0.08 * pulse;

    const forceActive = (i: number) => {
        const el = itemRefs.current[i];
        if (!el) return;

        // lock IO pendant le scroll animé
        manualLockUntilRef.current = performance.now() + MANUAL_LOCK_MS;
        if (manualLockTimerRef.current) window.clearTimeout(manualLockTimerRef.current);
        manualLockTimerRef.current = window.setTimeout(() => {
            manualLockUntilRef.current = 0;
        }, MANUAL_LOCK_MS);

        // force l'actif tout de suite (carte gauche)
        setActiveIndex(i);

        // scroll vers la carte
        el.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "center",
        });
    };


    return (
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            {/* Desktop only: carte dynamique à gauche */}
            <aside className="hidden lg:block lg:sticky lg:top-4 self-start z-20">
                <div className={CARD_CLASS}>
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                            <Image src={withBasePath(active.logoSrc)} alt={active.title} width={34} height={34} />
                        </div>

                        <div className="min-w-0">
                            <div className="truncate text-lg font-semibold text-white">{active.title}</div>
                        </div>
                    </div>

                    {/* <p className="mt-4 text-sm leading-relaxed text-white/70">{active.summary}</p> */}

                    {!!active.tags?.length && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {active.tags.slice(0, 6).map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-xs text-white/80"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                            <span>{active.title}</span>
                            <span>{step}/{total}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                            <div className="h-full bg-white/90" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right column */}
            <div ref={rightColRef} className="relative isolate">
                {/* Halo en fond */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-sm"
                        style={{
                            left: haloPos.x,
                            top: haloPos.y,
                            width: coreSize,
                            height: coreSize,
                            opacity: coreOpacity,
                        }}
                    />
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"
                        style={{
                            left: haloPos.x,
                            top: haloPos.y,
                            width: glowSize,
                            height: glowSize,
                            opacity: glowOpacity,
                        }}
                    />
                </div>

                {/* Mobile: petite progress bar simple au-dessus de la liste (optionnel, utile) */}
                <div className="mb-4 lg:hidden">
                    <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                        <span>Path</span>
                        <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                        <div className="h-full bg-white/90" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>

                {/* Liste */}
                <div className="flex flex-col" style={{ gap: GAP_PX }}>
                    {safeProjects.map((p, i) => (
                        <div
                            key={p.slug}
                            data-index={i}
                            ref={(el) => {
                                itemRefs.current[i] = el;
                            }}
                            className={`${CARD_CLASS_GLASS} cursor-pointer`}
                            role="button"
                            tabIndex={0}
                            onClick={() => forceActive(i)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") forceActive(i);
                            }}
                        >
                            <div className="flex items-start gap-4 flex-col">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                                    <Image src={withBasePath(p.logoSrc)} alt={p.title} width={28} height={28} />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-xl font-semibold tracking-tight text-white">{p.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-white/70">{p.summary}</p>

                                    {!!p.tags?.length && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {p.tags.slice(0, 8).map((t) => (
                                                <span
                                                    key={t}
                                                    className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-xs text-white/80"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <a
                                            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                                            href={withBasePath(p.href)}
                                        >
                                            Read more
                                        </a>
                                        {
                                            p.linkProject && (
                                                <a
                                                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                                                    href={p.linkProject}
                                                >
                                                    View project
                                                </a>
                                            )}

                                        {/* check active debug */}
                                        {/* <div className="ml-auto hidden text-xs text-white/50 lg:block">
                                            {i === deferredActiveIndex ? "Active" : ""}
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-10" />
            </div>
        </div>
    );
}
