// app/layout.tsx
import type { Metadata } from "next";
import { SITE } from "@/lib/seo/site";
import "./globals.css";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: {
        default: SITE.name,
        template: `%s — ${SITE.name}`,
    },
    description: SITE.defaultDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={GeistSans.className}>
            <body>{children}</body>
        </html>
    );
}
