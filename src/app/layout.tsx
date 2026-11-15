import type { Metadata, Viewport } from "next";

import "@/app/globals.css";

import { forsha, forshaScribble } from "@/app/fonts";
import { LocaleShell } from "@/components/site/locale-shell";
import { PageTransition } from "@/components/site/page-transition";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "7orlon — paintings that hold the light",
    template: "%s · 7orlon",
  },
  description:
    "A small studio collection of original, one-of-one paintings by Noor Haddad. Soft colour, slow mornings, shipped worldwide.",
  openGraph: {
    title: "7orlon — paintings that hold the light",
    description:
      "A small studio collection of original, one-of-one paintings by Noor Haddad.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${forsha.variable} ${forshaScribble.variable} antialiased`}
      >
        {/* Sections wait, invisible, for a script to notice them scrolling into
            view. Without script nothing ever would, so show them outright. */}
        <noscript>
          <style>{".domino-wait > * { opacity: 1 !important; }"}</style>
        </noscript>
        <Providers>
          <LocaleShell>
            <PageTransition>{children}</PageTransition>
          </LocaleShell>
        </Providers>
      </body>
    </html>
  );
}
