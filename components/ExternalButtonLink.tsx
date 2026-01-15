// components/ExternalButtonLink.tsx
import React from "react";

type ExternalButtonLinkProps = {
    href: string;
    label: string;
    className?: string;
};

export function ExternalButtonLink({
    href,
    label,
    className = "btn btn-ghost",
}: ExternalButtonLinkProps) {
    return (
        <a
            className={className}
            href={href}
            target="_blank"
            rel="noreferrer"
        >
            {label}
        </a>
    );
}
