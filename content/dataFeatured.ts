// content/dataFeatured.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { VerticalProject } from "@/components/VerticalProjectsRail";

function getMdxSummary(lang: string, slug: string) {
    const filePath = path.join(process.cwd(), "content", lang, "projects", `${slug}.mdx`);

    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    return typeof data.summary === "string" ? data.summary : null;
}

export const verticalBase = (lang: string): VerticalProject[] => [
    {
        slug: "ambassade",
        title: "Ambassade de France en Autriche",
        summary: "System administrator responsible for server operations, virtualized environments, asset management (GLPI), Network Operations and technical user support.",
        logoSrc: "/logos/ministeres.png",
        href: `/${lang}/projects/ambassade/`,
        tags: [
            "System administration",
            "Network operations",
            "VM",
            "GLPI",
        ],
    },
    {
        slug: "orbat-creator",
        title: "Orbat Creator",
        summary: "Generate simple SVG and PNG files to visualise the ORBAT briefing at a glance.",
        logoSrc: "/logos/orbat-c.png",
        href: `/${lang}/projects/orbat-creator/`,
        linkProject: `https://olimolly.github.io/orbat/editor/`,
        tags: ["Next.js", "TypeScript", "config generator"],
    },
    {
        slug: "GESE",
        title: "GESE",
        summary: "Event Management Web Application with Admin Dashboard.",
        logoSrc: "/logos/GESE-7e.png",
        href: `/${lang}/projects/gese/`,
        linkProject: `https://a4units.com/en/concept`,
        tags: ["Next.js", "TypeScript", "Full-Stack"],
    },
    {
        slug: "cma",
        title: "Chambre des Métiers et de l'Artisanat.",
        summary: "Consolidation of business services into a CRM and data migration toward a microservices-oriented architecture.",
        logoSrc: "/logos/cma.png",
        href: `/${lang}/projects/cma/`,
        tags: ["Laravel", "Vue.js", "Efficy CRM", "Database migration", "PostGreSql"],
    },
    {
        slug: "linkt",
        title: "Linkt",
        summary: "Development of a middleware for managing an internet access service catalog, integrated with provider APIs.",
        logoSrc: "/logos/linkt.png",
        href: `/${lang}/projects/linkt/`,
        tags: ["Laravel", "Redis"],
    },
    {
        slug: "lery-poses",
        title: "Léry Poses",
        summary: "Nautical activities",
        logoSrc: "/logos/lery-g.png",
        href: `/${lang}/projects/lery-poses/`,
        linkProject: `https://lery-poses.fr/en`,
        tags: ["Strapi", "Next.js", "React", "Material UI", "SCSS"],
    },
    {
        slug: "promuseum",
        title: "Promuseum",
        summary: "Museum equipment",
        logoSrc: "/logos/promuseum.png",
        href: `/${lang}/projects/promuseum/`,
        linkProject: `https://promuseum.eu/en`,
        tags: ["Laravel", "Repository Pattern", "CRM", "Data export"],
    },
    {
        slug: "d-impulse",
        title: "D-Impulse",
        summary: "Consulting and digital agency",
        logoSrc: "/logos/d-impulse.png",
        href: `https://d-impulse.com/`,
        tags: ["Consulting", "Development"],
    },
    {
        slug: "carrefour",
        title: "Carrefour Maxxing",
        summary: "Voucher system",
        logoSrc: "/logos/carrefour.png",
        href: `/${lang}/projects/carrefour/`,
        tags: ["PHP5", "SOAP API", "VM", "Batch"],
    },
];

export const vertical = (lang: string): VerticalProject[] =>
    verticalBase(lang).map((project) => ({
        ...project,
        summary: getMdxSummary(lang, project.slug) ?? project.summary,
    }));