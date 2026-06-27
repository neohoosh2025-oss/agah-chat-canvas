# Landing page for «آگاه»

A new minimal Persian RTL landing page that lives at `/` and routes users into the existing chatbot. The current chatbot UI at `src/routes/index.tsx` moves to `/chat` so the landing becomes the front door.

## Routes (TanStack file-based)

```
src/routes/
  index.tsx        → / (NEW landing)
  chat.tsx         → /chat (moved chatbot, unchanged behavior)
  blog.tsx         → /blog (article list)
  blog.$slug.tsx   → /blog/:slug (article detail)
```

`createFileRoute` strings updated to match. `__root.tsx` keeps `dir="rtl"` and the Vazirmatn/Yekan Bakh font link.

## Section 1 — Hero (100dvh)

- Sticky header (`h-14`, `border-b border-border/60`, `bg-background/80 backdrop-blur`)
  - Right (RTL start): brand wordmark «آگاه» in slate navy, weight 700
  - Left: pill button «ورود به دستیار» → `navigate({ to: '/chat' })`
- Centered column, `max-w-2xl mx-auto px-5`, vertically centered with `flex-1`:
  - Hero image `baner.png`, `rounded-2xl`, `max-h-[250px] lg:max-h-[350px]`, `object-cover`, soft 1px border, no shadow
  - Headline (single bold line, ~28px mobile / 36px desktop): «وقتی تو خوابی، آگاه به فکر کسب‌وکارته»
  - Search input (`h-14`, `rounded-full`, `border border-border`, `bg-card`, focus ring emerald):
    - placeholder «از دستیار بپرس...»
    - Trailing emerald circular send button (`bg-accent text-white`, `size-10`, arrow icon mirrored for RTL)
    - Enter or send click → `navigate({ to: '/chat', search: { q: text } })`
  - Three suggestion chips row (`flex-wrap gap-2 justify-center`), `rounded-full px-4 py-2 text-[13px] bg-secondary hover:bg-secondary/70`:
    - «تحلیل رقبای محله من» / «مدارک مجوز کسب» / «مشاوره افزایش فروش»
    - Click → same navigate with `q` preset

## Section 2 — About + Magazine

- `max-w-5xl mx-auto px-5 py-20 space-y-16`
- «چرا آگاه؟» small title (text-sm uppercase tracking, muted)
  - 4 feature cards, `grid grid-cols-2 lg:grid-cols-4 gap-4`
  - Each card: lucide icon (emerald, 20px), two-word title (weight 600), one-line description (muted, 13px). No shadow, `border border-border/60 rounded-2xl p-5 bg-card`.
  - Items: «تحلیل رقبا» / «مجوز و مدارک» / «رشد فروش» / «مشاوره ۲۴ ساعته»
- «مجله آگاه» section
  - Header row: title + `<Link to="/blog">همه مطالب →</Link>`
  - 3 article rows (`divide-y divide-border`), each row: tag badge (rounded-full, bg-secondary, text-xs) + title (medium) + date (muted, tabular-nums). Hover: bg-secondary/40. `<Link to="/blog/$slug">`.
- CTA card: centered, `rounded-2xl border bg-card p-10 text-center`
  - Button «همین الان شروع کن» → `/chat`
- Footer: single line, centered, muted text-xs: «آگاه — دستیار هوشمند کسب‌وکار شما»

## Blog pages

- Articles stored as a typed array in `src/lib/articles.ts` (id, slug, title, tag, date, body). 3–4 sample entries in Persian.
- `/blog`: back button (chevron, RTL-aware) + same row list of all articles.
- `/blog/$slug`: back button + tag + title (large, bold) + date + body (`prose-like` manual styles, `max-w-2xl mx-auto`, line-height relaxed). 404 via `notFoundComponent` if slug missing.

## Chat preload from query

`/chat` reads `search.q` via `validateSearch` (zod-free, simple object). On mount, if `q` is present, it's injected into the chat as the first user message and cleared from the URL with `navigate({ to: '/chat', search: {}, replace: true })`.

## Design tokens

Already in `src/styles.css` — primary slate navy, accent emerald, bg, foreground all match the brief. No new tokens needed. Yekan Bakh: add `<link>` to a Yekan Bakh CDN in `__root.tsx` head and set `--font-sans` to `"Yekan Bakh", "Vazirmatn", system-ui` in `@theme`. Fallback stays Vazirmatn so nothing breaks if the CDN fails.

## Constraints honored

- No gradients, no glow, no pulse, no bounce. Transitions limited to `transition-colors` on hover.
- Whitespace-led layout, single bold headline, rest regular/medium.
- Mobile-first; `lg:` only for wider grid and image height.
- All copy Persian, `dir="rtl"` from root.

## Out of scope

- No real CMS; articles are a static TS array (easy to swap for Cloud later).
- Chatbot internal behavior unchanged beyond reading `?q=`.
