// src/lib/mdx-components.tsx
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

function isInternalLink(href: string) {
    return href.startsWith("/") || href.startsWith("#");
}

export const mdxComponents: MDXComponents = {
    a: ({ href = "", children, ...props }) => {
        const link = String(href);

        if (isInternalLink(link)) {
            return (
                <Link
                    href={link}
                    className="underline underline-offset-4 hover:opacity-80"
                >
                    {children}
                </Link>
            );
        }

        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:opacity-80"
                {...props}
            >
                {children}
            </a>
        );
    },

    h2: ({ children, ...props }) => (
        <h2
            className="mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight"
            {...props}
        >
            {children}
        </h2>
    ),

    h3: ({ children, ...props }) => (
        <h3
            className="mt-8 scroll-mt-28 text-xl font-semibold tracking-tight"
            {...props}
        >
            {children}
        </h3>
    ),

    blockquote: ({ children, ...props }) => (
        <blockquote
            className="my-6 border-l-4 border-neutral-300 pl-4 italic text-neutral-700"
            {...props}
        >
            {children}
        </blockquote>
    ),

    ul: ({ children, ...props }) => (
        <ul className="my-5 list-disc space-y-2 pl-6" {...props}>
            {children}
        </ul>
    ),

    ol: ({ children, ...props }) => (
        <ol className="my-5 list-decimal space-y-2 pl-6" {...props}>
            {children}
        </ol>
    ),

    pre: ({ children, ...props }) => (
        <pre
            className="my-6 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed"
            {...props}
        >
            {children}
        </pre>
    ),

    code: ({ children, ...props }) => (
        <code
            className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.95em]"
            {...props}
        >
            {children}
        </code>
    ),
};
