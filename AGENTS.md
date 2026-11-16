<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 7orlon — project conventions

Read `README.md` first; it carries the stack table, the setup steps and the
caveats. What follows is only what an agent needs that the README does not
spell out.

## Non-negotiables

- **Server state → TanStack Query. Client/UI state → Zustand. Never both.**
  If a value comes from the database it belongs in a query; if it describes
  what the visitor is doing right now, it belongs in
  `src/stores/gallery-store.ts`.
- **The database is `data/db.json`.** Read it with `readDb()`, change it with
  `mutateDb()` (both in `src/db`) — never with `fs` directly, and never by
  importing the JSON. `mutateDb` is what makes writes serial and atomic.
- **Stored shapes never cross the wire.** `features/*/server.ts` owns the
  row→wire serialisers (cents → string, array index → `position`). A component
  that imports from `@/db` is a bug.
- **Every feature is four files** — `types.ts`, `server.ts`, `api.ts`,
  `queries.ts` — in that order of dependency. Add the fifth file under
  `components/`, not beside them.
- **Pages prefetch, they do not fetch.** A Server Component calls
  `makeQueryClient()`, prefetches with the *same key* the client hook reads and
  the `server.ts` function as `queryFn`, then hydrates. Never `fetch()` our own
  route handlers from a Server Component.
- **External APIs live in `src/server/providers/*`** behind a typed interface,
  and their failures surface as `422`, not `500`. Uploads are one of these:
  `storage.ts` writes to `public/uploads/`, inside the repo.
- **Everything under `/admin` and `/api/admin` checks the session itself.**
  A page calls `requireAdminPage()`, a route handler starts with
  `adminGuard()` (both in `features/admin/server.ts`). There is no proxy doing
  it for them; a new admin route without the guard is public.

## The design

- Colour, shape and spacing come from `src/app/globals.css`. Do not hard-code a
  hex that is not one of the five plates or their strong partners.
- Coloured shapes are brush masks, never borders or rounded rectangles. Use
  `<Brush>`, `<BrushButton>`, `<BrushTag>` from `@/components/brush`.
- Layout uses logical properties (`inset-inline-start`, `ms-*`) because the app
  runs right-to-left in Arabic. Decorative marks stay physical on purpose.
- Entrances are dominoes. Content on screen when a page opens gets the
  `.domino` class on its container; content below the fold is wrapped in
  `<Reveal>` from `@/components/motion`, which plays the same cascade once
  half of the section is in view. Put `<Reveal>` on the section itself and
  sequence what is inside with nested `.domino` containers — not one Reveal
  per piece. Neither goes on an element whose direct children set
  `opacity` inline (the showcase's stacked slides) — the inline style wins.
  The cascade runs by importance, not markup order: the piece that matters
  most (a hero's picture) falls first — give it `[--domino-order:0]` — and a
  parent lands before its children (see the hero for the pattern). The header
  always leads: the section straight after it waits `--domino-header-beat`
  automatically, so do not start page content at 0 by other means. Write
  `--domino-*` times at pace 1; `--domino-pace` in `globals.css` scales every
  entrance, gallery and desk alike, and is the one place to change the tempo.
  On the desk the sidebar is the header: the shell makes the first page wait
  for it, and a page's body starts at `--domino-base:240ms`, after the three
  lines of `<DeskHeading>`.
  Page-to-page fades are automatic: `<PageTransition>` in the root layout
  handles every `<Link>`, so do not add per-link handlers.
- Interface copy goes in `src/lib/i18n.ts` and must be added to **both**
  languages — the `Dictionary` type enforces it. Painting copy is content and
  lives in the database.
- Those dictionary entries are *defaults*: the studio can rewrite any of them
  at `/admin/content`, and `useT()` lays the rewrites over the dictionary. So a
  new public key also needs a row in `features/content/sections.ts`, or the
  desk cannot edit it. The desk's own labels live in the separate `ADMIN_T`
  dictionary (`useT().a`) and are not editable.

## Before you finish

```bash
npm run lint && npm run typecheck
```

Both must be clean. `npx next typegen` regenerates `PageProps` / `RouteContext`
after adding a route.
