"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/lang";
import { switchLangPath } from "@/lib/i18n/switchLangPath";

export default function LangSwitch() {
    const pathname = usePathname();

    return (
        <div style={{ display: "flex", gap: 8 }}>
            {(["en", "fr"] as Lang[]).map((lang) => (
                <Link
                    key={lang}
                    href={switchLangPath(pathname, lang)}
                >
                    {lang.toUpperCase()}
                </Link>
            ))}
        </div>
    );
}
