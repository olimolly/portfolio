import type { Metadata } from "next";
import { SITE } from "./site";

type BuildMetaInput = {
    title: string;                 // titre page (sans suffixe)
    description?: string;
    image?: string;                // "/images/xxx.jpg"
    pathname?: string;             // "/en/projects/orbat-creator/"
    locale?: "en" | "fr";
};

export function buildMetadata(input: BuildMetaInput): Metadata {
    const description = input.description ?? SITE.defaultDescription;

    const url = input.pathname ? new URL(input.pathname, SITE.url) : new URL(SITE.url);

    const images = input.image
        ? [{ url: new URL(input.image, SITE.url) }]
        : undefined;

    return {
        title: {
            default: SITE.name,
            template: `%s — ${SITE.name}`,
            absolute: input.title, // Next gère le template via pages aussi; ici on donne le titre “nu”
        },
        description,
        metadataBase: new URL(SITE.url),

        alternates: {
            canonical: url,
        },

        openGraph: {
            title: input.title,
            description,
            url,
            siteName: SITE.name,
            type: "website",
            locale: input.locale,
            images,
        },

        twitter: {
            card: images ? "summary_large_image" : "summary",
            title: input.title,
            description,
            images: images?.map((i) => i.url),
        },
    };
}
