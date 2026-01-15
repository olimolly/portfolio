"use client";

import { UiMessages } from "@/i18n/ui.types";
import { createContext, useContext } from "react";

const TranslationsContext = createContext<UiMessages | null>(null);

export function TranslationsProvider({
    value,
    children,
}: {
    value: UiMessages;
    children: React.ReactNode;
}) {
    return (
        <TranslationsContext.Provider value={value}>
            {children}
        </TranslationsContext.Provider>
    );
}

export function useTranslationsUi() {
    const ctx = useContext(TranslationsContext);
    if (!ctx) {
        throw new Error("useTranslationsUi must be used within TranslationsProvider");
    }
    return ctx;
}
