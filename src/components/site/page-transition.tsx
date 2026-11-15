"use client";

import * as React from "react";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

/** How long the page that is being left takes to fade, in milliseconds. */
const FADE_OUT_MS = 180;

/** If a navigation never lands, the page comes back rather than staying blank. */
const GIVE_UP_MS = 6000;

type Transition = {
  /** True from the click until the next page has taken over. */
  leaving: boolean;
  /** Where we are headed while `leaving`; null otherwise. */
  target: string | null;
};

const TransitionContext = React.createContext<Transition>({
  leaving: false,
  target: null,
});

/** For a frame that stays put across pages and fades only its own content. */
export function usePageTransition(): Transition {
  return React.useContext(TransitionContext);
}

/**
 * The studio desk keeps its sidebar on screen between its own pages, so a
 * desk-to-desk move must not fade (or remount) the whole frame — the desk's
 * shell fades just its page. The login page is not part of that frame.
 */
function isDesk(pathname: string): boolean {
  return pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
}

/** Paths that are files or endpoints, not pages the router can show. */
const NOT_A_PAGE = /^\/(?:api|uploads|_next)\//;

/**
 * Every move between pages, anywhere on the site: the page you are on fades
 * out, then the next one fades in and its dominoes fall.
 *
 * It works by listening for clicks on ordinary links rather than by wrapping
 * each one, so a `<Link>` added tomorrow gets the transition without knowing
 * this exists. The click is caught before Next sees it, the page fades, and
 * only then is the router asked to go — as a React transition, so the faded
 * page stays mounted until its replacement is ready.
 *
 * Left alone on purpose: new-tab and modified clicks, downloads, other sites,
 * `mailto:`, and links within the same page (`#enquire`).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // A departure is "leaving `from` for `to`". It is over the moment the
  // pathname is no longer `from` — derived, so nothing has to remember to
  // clear it when the new page lands.
  const [departure, setDeparture] = React.useState<{
    from: string;
    to: string;
  } | null>(null);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    let timers: Array<ReturnType<typeof setTimeout>> = [];

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest("a");
      if (
        !anchor ||
        !anchor.href ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname ||
        NOT_A_PAGE.test(url.pathname)
      ) {
        return;
      }

      // Next's <Link> stands down when the click is already prevented, so
      // this one call is what hands the navigation to us.
      event.preventDefault();

      timers.forEach(clearTimeout);
      setDeparture({ from: window.location.pathname, to: url.pathname });
      timers = [
        setTimeout(
          () =>
            startTransition(() =>
              router.push(`${url.pathname}${url.search}${url.hash}`),
            ),
          FADE_OUT_MS,
        ),
        setTimeout(() => setDeparture(null), GIVE_UP_MS),
      ];
    };

    // Capture phase, on the document: ahead of React's own listener.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      timers.forEach(clearTimeout);
    };
  }, [router]);

  const leaving = departure?.from === pathname;
  const target = leaving ? departure.to : null;

  // Desk to desk, the shell handles it; everything else fades the whole page.
  const withinDesk = isDesk(pathname) && target !== null && isDesk(target);

  const transition = React.useMemo(
    () => ({ leaving, target }),
    [leaving, target],
  );

  return (
    <TransitionContext.Provider value={transition}>
      <div
        // Keyed by the route so each page mounts fresh and plays its entrance
        // — except inside the desk, whose frame must survive the move.
        key={isDesk(pathname) ? "desk" : pathname}
        className={cn(
          "page-enter transition-opacity ease-atelier",
          leaving && !withinDesk ? "opacity-0" : "opacity-100",
        )}
        style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
