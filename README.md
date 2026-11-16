# 7orlon — Atelier Gallery

A bilingual (English / Arabic) storefront for one-of-one original paintings.
One work at a time on the wall, a plain index of everything else, a page for the
studio behind them, and a full-screen view for looking properly.

The visual design is a faithful implementation of the Claude Design handoff in
[`design-reference/`](design-reference) — paper, ink, and photographed brush
strokes used as CSS masks. The architecture is a conventional Next.js 16 App
Router app: a JSON file for a database, TanStack Query for server state,
Zustand for what the visitor is doing, zod at every boundary — and a studio
desk at `/admin`, in the same paint, where every word and picture on the site
can be changed.

---

## Stack

| Layer | Choice | Why it is here |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components prefetch; real routes for `/`, `/artist`, `/works/[slug]` |
| UI | **React 19** | — |
| Database | **`data/db.json`**, validated with zod | One file, in the repository, read and written through `src/db`. No server to run; see [Caveats](#caveats) for what that costs |
| Uploads | **`public/uploads/`** | Photographs added at the desk are written into the repository, next to the row that points at them |
| Server state | **TanStack Query v5** | Prefetch on the server, `useSuspenseQuery` on the client, one key factory per feature |
| Client state | **Zustand v5** | Reading language (persisted), showcase position, index page |
| Validation | **zod v4** | One schema per wire shape, shared by the route handler and the client fetcher |
| Styling | **Tailwind CSS v4** | Theme lives in `globals.css`; no `tailwind.config` |
| Animation | **motion** (`motion/react`) | `FadeIn`, `Stagger`, `AnimatedNumber` |
| Primitives | **radix-ui**, `class-variance-authority`, `clsx`, `tailwind-merge` | shadcn-compatible (`components.json`), restyled to the house |
| Icons | **lucide-react** | |
| Theme | **next-themes** | Light by default; dark tokens defined, no toggle shipped |
| Charts | **recharts v3** | Installed per spec; see [Caveats](#caveats) |

---

## Setup

You need Node 20.9+. There is no database server to install: the catalogue —
twelve paintings, three hero works, the studio profile, its photographs and its
milestones, all bilingual — is already in `data/db.json`.

```bash
npm install
```

Copy the environment file and set the two admin values in it:

```bash
cp .env.example .env
```

`ADMIN_PASSWORD` is what you sign in to `/admin` with; `ADMIN_SESSION_SECRET`
signs the session cookie. `.env.example` documents every variable.

Then:

```bash
npm run dev
```

The gallery is at `http://localhost:3000`, the studio desk at
`http://localhost:3000/admin`.

---

## The studio desk

`/admin` is where the site is run from. It is one password (no user table),
bilingual like the gallery, and built from the same brush components.

| Page | What it controls |
| --- | --- |
| **Overview** `/admin` | Counts, the value on the wall, works per plate, the latest enquiries |
| **Paintings** `/admin/paintings` | Add, edit and delete works; reorder the wall; flip available / sold; up to twelve photographs per work (the first is the cover; visitors swap between them with arrows), price, plate, address, and the title, medium, size, year and description in both languages |
| **Hero wall** `/admin/hero` | The pictures that rotate behind the landing headline, their order and descriptions |
| **Artist** `/admin/artist` | Portrait, email, social links, studio photographs and captions, milestones |
| **Site copy** `/admin/content` | Every line of interface text on the site — headline, figures, buttons, the artist's statement, form labels — in English and Arabic |
| **Enquiries** `/admin/enquiries` | Who has written about which work; reply by email, or delete |

Signing in sets a signed, http-only cookie that lasts a week. Every admin page
and every `/api/admin/*` route handler checks it for itself; without it a page
redirects to the login and a handler answers `401`.

Site copy is stored as *overrides*: `src/lib/i18n.ts` remains the default
dictionary, the desk saves only the lines that differ from it, and `useT()`
lays the two together. Emptying a line at the desk returns it to its default.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` |

The `db:*` scripts and the `prisma/` folder are left over from the Postgres
version of this app and are no longer used at runtime — see
[Caveats](#caveats).

---

## Structure

```
data/
└── db.json                  # the database: paintings, enquiries, hero
                             # slides, the artist, site-copy overrides

public/
├── images/                  # the photographs the design shipped with
└── uploads/                 # photographs added at the studio desk

src/
├── app/
│   ├── layout.tsx           # fonts, metadata, providers, direction shell
│   ├── page.tsx             # prefetch → HydrationBoundary → <Home/>
│   ├── artist/page.tsx
│   ├── works/[slug]/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── (desk)/          # layout = session check + the desk's frame
│   │       ├── page.tsx                 overview
│   │       ├── paintings/               list · new · [id]
│   │       ├── hero/  artist/  content/  enquiries/
│   ├── uploads/[name]/route.ts          # serves uploads a running
│   │                                    # production server has not indexed
│   ├── globals.css          # the whole design system
│   └── api/
│       ├── paintings/route.ts                     GET
│       ├── paintings/[slug]/route.ts              GET · PATCH (admin)
│       ├── paintings/[slug]/enquiries/route.ts    POST
│       ├── enquiries/[id]/route.ts                DELETE
│       ├── hero-slides/route.ts                   GET
│       ├── artist/route.ts                        GET
│       ├── content/route.ts                       GET
│       ├── rates/route.ts                         GET
│       └── admin/           # every handler starts with adminGuard()
│           ├── login · logout                     POST
│           ├── uploads                            POST (multipart)
│           ├── paintings                          POST
│           ├── paintings/[id]                     PUT · DELETE
│           ├── paintings/order                    PUT
│           ├── hero-slides · artist · content     PUT
│           └── enquiries                          GET
│
├── db/
│   ├── schema.ts            # zod schema of data/db.json — stored shapes
│   └── index.ts             # readDb(), mutateDb(): serial, atomic writes
├── server/
│   ├── media.ts             # deletes uploads nothing points at any more
│   └── providers/           # external systems, isolated and swappable
│       ├── rates.ts         # RatesProvider interface + two implementations
│       └── storage.ts       # ImageStorage interface → public/uploads
│
├── features/
│   ├── paintings/
│   │   ├── types.ts         # zod schemas — the single source of wire truth
│   │   ├── server.ts        # db reads/writes + row→wire serialisers
│   │   ├── api.ts           # client fetchers, each parsing with its schema
│   │   ├── queries.ts       # paintingKeys, queryOptions, hooks, mutations
│   │   ├── plates.ts        # the five house colours
│   │   ├── hits.ts          # seeded brush placement + contain-fit maths
│   │   └── components/
│   ├── artist/              # same four files
│   ├── content/             # same four + sections.ts (the editor's layout)
│   └── admin/               # same four (session, uploads) + components/:
│                            # the shell, the login and every desk screen
│
├── components/
│   ├── brush/               # Brush, BrushButton, BrushTag, BrushUnderline
│   ├── motion/              # FadeIn, Stagger, AnimatedNumber
│   ├── providers/           # ThemeProvider → QueryProvider
│   ├── site/                # header, back header, footer, language switch
│   └── ui/                  # card, field, checkbox, skeleton
│
├── lib/                     # utils (cn), api (apiFetch), format, i18n,
│                            # query-client (makeQueryClient, HttpError)
├── stores/                  # zustand — client/UI state only
├── hooks/
├── fonts/                   # DG Forsha, DG Forsha Scribble
└── generated/prisma/        # Prisma client output (gitignored)
```

### The feature-folder contract

Every feature is the same four files, in the same order of dependency:

- **`types.ts`** — zod schemas and their inferred types. If it crosses the
  network, it is described here.
- **`server.ts`** — `import "server-only"`. Reads (`readDb`) and writes
  (`mutateDb`), plus the serialisers that turn stored rows into the wire
  format: cents → string, a row's place in its array → `position`. Stored
  shapes never leave this file.
- **`api.ts`** — thin client fetchers over `apiFetch`, each parsing its response
  with the schema from `types.ts`.
- **`queries.ts`** — the key factory, exported `queryOptions`, suspense hooks,
  and mutations that invalidate or optimistically patch the cache.

### How data moves

- **Server state → TanStack Query. Client state → Zustand. Never both.**
- A page is a Server Component that calls `makeQueryClient()`, prefetches with
  the *same key* the client hook uses and the `server.ts` function as `queryFn`,
  then renders `<HydrationBoundary>` around a `<Suspense>` wrapping the client
  component. No page fetches its own HTTP API.
- Route handlers `safeParse` the body and answer `400 {error, issues}` on a bad
  shape, `401` without the admin session, `404` for a missing work, `409` for a
  duplicate enquiry or a taken address, `422` when a provider fails, `201` on
  create, `204` on delete.
- The enquiry mutation is undoable; marking a work sold and re-hanging the wall
  patch the cache optimistically (`onMutate` snapshot → `onError` rollback →
  `onSettled` invalidate).
- The database's array order is the wall's order: there is no `position`
  column to keep in step, and reordering is rewriting one array.
- A write goes through `mutateDb`, which queues it behind any write already in
  flight and replaces the file atomically (temp file, then rename).
- External APIs live only in `src/server/providers/*` behind a small typed
  interface, so a source that breaks can be swapped without touching a feature.

---

## The design system

Everything is in [`src/app/globals.css`](src/app/globals.css). It is a paper
design: `#fbfaf9` ground with a printed texture, `#201e1d` ink, DG Forsha
throughout, and no boxes — hierarchy comes from type and whitespace.

**Colour** is five pale plates (`mint`, `blush`, `butter`, `leaf`, `jade`), each
with one saturated partner used for underlines, dots and markers. A work is
assigned a plate; the plate paints the wall behind it and tints its heading.

**Every coloured shape is paint.** The one mechanic the design rests on is the
`.brush` class: a flat fill masked to the silhouette of a photographed stroke
from `public/brush/`. Set `--brush` and the element takes that shape.

```tsx
<Brush shape="wide" color="#F7A3B8" className="h-3 w-[38px]" />
```

`BrushButton`, `BrushTag` and `BrushUnderline` build on it. Nothing in the app
draws a border, a rounded rectangle, or a gradient to suggest a shape — if it
has an edge, that edge came off a brush.

The one deliberate exception is the header. It is an **island**: a
soft-cornered strip floating just below the top edge, centred and narrower
than the page, clear until the page scrolls and then a pale veil with a light
blur and a small shadow (`.atelier-veil`). `SiteHeader` and `BackHeader` share
its shape through the `ISLAND` / `ISLAND_DOCK` class lists in
`components/site/site-header.tsx`.

**Placement is deterministic, not random.** The four strokes thrown around a
painting on the showcase wall are seeded from the work's position
(`features/paintings/hits.ts`), and which edges they land on is decided by the
picture's own proportions. Same work, same marks, on the server and on the
client.

**Motion** is one curve — `--ease-atelier`, `cubic-bezier(.22,.7,.2,1)` — and
springs with `bounce: 0`. Reduced-motion is honoured globally. Three pieces
carry every page, gallery and desk alike:

- **`.domino`** (globals.css) — put it on a container and its direct children
  arrive one after another. Pure CSS, so it plays on load with no script. Used
  for whatever is on screen when a page opens. The most important piece falls
  first: `--domino-order` on a piece overrides its position in the row, which
  is how the hero's picture leads the copy that precedes it in the markup.
  The header always arrives first — the section after it waits
  `--domino-header-beat` — and `--domino-pace` multiplies every domino time on
  the site (1.5), so the tempo is one number. On the desk the sidebar plays
  the header's part.
- **`<Reveal>`** (`components/motion`) — the same cascade, held back until the
  section is half in view (or fills half the screen, for a long one). Used for
  everything below the fold, one per section. `amount` overrides the half. A
  `.domino` container nested inside a Reveal waits with it, so a busy section
  plays as one series: give each inner container a `--domino-base` and its
  pieces fall after the ones before.
- **`<PageTransition>`** (`components/site`) — wraps the app in the root
  layout. It catches clicks on ordinary links, fades the current page out,
  then navigates; the next page is keyed by its route, so it mounts fresh and
  its dominoes fall. Inside the desk only the page fades — the sidebar stays.

**Direction.** Arabic reads right-to-left, so the layout uses logical properties
(`inset-inline-start`, `ms-*`) everywhere except the decorative marks, which are
physical on purpose — a brush stroke does not mirror.

---

## Caveats

- **The database and the uploads need a disk that persists.** `data/db.json`
  and `public/uploads/` are written at runtime, so this runs on a laptop, a
  VPS, or a container with a volume — not on a read-only or serverless host
  (Vercel, for one), where every write would be lost or refused. Edits made on
  a server live on that server until you commit them from there.

- **One process writes the database.** Writes are queued inside a single Node
  process. Two server instances pointed at the same file can overwrite each
  other; run one.

- **The admin is one password.** No accounts, no roles, no audit trail. Guesses
  are limited to eight per ten minutes per client, counted in memory. Serve it
  over HTTPS in production — the session cookie is marked `secure` there.

- **A picture uploaded and then abandoned stays on disk.** Replacing or
  deleting a *saved* picture removes its file; one uploaded into a form that is
  never saved is not tracked and is left in `public/uploads/`.

- **The JSON database and in-repo uploads are interim.** The plan is to move to
  Postgres for data and S3 for photographs. Until then the way to publish is:
  run the desk locally, commit `data/db.json` and `public/uploads/`, and
  deploy. The two seams the move will go through already exist — `src/db`
  (`readDb` / `mutateDb`) behind the `features/*/server.ts` files, and the
  `ImageStorage` interface in `src/server/providers/storage.ts`.

- **Prisma is still installed but unused — on purpose.** `prisma/`,
  `prisma.config.ts`, `src/generated/`, the `db:*` scripts and the
  `postinstall` / `build` calls to `prisma generate` are from the Postgres
  version. Nothing imports them at runtime; they are kept as the starting
  point for the return to Postgres.

- **The page title and description in `layout.tsx` are not editable** from the
  desk; everything else a visitor reads is.

- **Six of the twelve works have no photograph.** The handoff bundle shipped
  images for six paintings, three hero works, the portrait and three studio
  shots; they were extracted from `.image-slots.state.json` into
  `public/images/`. The rest render the "photograph on its way" state, which is
  a real state the design already had. Upload one from `/admin/paintings` to
  fill it.

- **`recharts` is installed and unused.** The scaffold spec pins it; the
  reference design has no data visualisation and inventing one would have been a
  deviation. The `.recharts-tooltip-wrapper` rule in `globals.css` is ready for
  the day there is a chart. Remove the dependency if that day is not coming.

- **`next-themes` ships no toggle.** Dark tokens are defined in `globals.css`
  and the provider is wired with `attribute="class"`, but the reference is a
  paper design and adding a switch to the header would have changed it. Flip
  `defaultTheme` in `src/components/providers/index.tsx` to see the dark set.

- **Currency conversion is stubbed by default.** Prices are stored as USD cents
  (an integer) and displayed in USD. `src/server/providers/rates.ts` has the
  swappable provider and a live `exchangerate.host` implementation behind
  `RATES_PROVIDER`; nothing in the UI selects a currency yet, because the
  reference has no currency control.

- **No `src/instrumentation.ts`.** Nothing in this app needs background work.

- **UI primitives are hand-written, not `shadcn add`-ed.** `components.json` is
  configured so `npx shadcn@latest add …` works, but every primitive here
  (`card`, `field`, `checkbox`, `skeleton`) was written in the house style —
  shadcn's defaults are bordered and rounded, which this design explicitly is
  not. Expect to restyle anything you add.

- **Pagination is built but dormant.** The index shows twelve per page and the
  collection is twelve, so the pager stays hidden — exactly as in the reference.
  Add a thirteenth work and it appears.

- **`design-reference/` is the original handoff bundle**, kept for comparison.
  It is excluded from TypeScript and ESLint and ships nothing to the browser.
  `DESIGN-HANDOFF.md` is the note that came with it.
