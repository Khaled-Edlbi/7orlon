"use client";

import * as React from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { QueryProvider } from "@/components/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      // The reference design is a paper design; the dark tokens exist in
      // globals.css but nothing in the gallery ships a toggle, so the system
      // preference is deliberately not consulted.
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>{children}</QueryProvider>
    </NextThemesProvider>
  );
}
