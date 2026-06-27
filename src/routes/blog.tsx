import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ARTICLES } from "@/lib/articles";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "مجله آگاه | یادداشت‌های مشاور هوشمند کسب‌وکار" },
      {
        name: "description",
        content: "خواندنی‌های کوتاه برای صاحبان کسب‌وکارهای کوچک ایران.",
      },
      { property: "og:title", content: "مجله آگاه" },
      {
        property: "og:description",
        content: "یادداشت‌های کوتاه درباره بازار، رقبا و رشد فروش.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <ArrowRight className="size-4" />
            بازگشت
          </Link>
          <span className="text-[13px] font-bold text-primary">مجله آگاه</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 lg:py-16">
        <h1 className="text-[24px] lg:text-[32px] font-extrabold tracking-tight text-primary">
          مجله آگاه
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          یادداشت‌های کوتاه درباره بازار، رقبا و رشد فروش.
        </p>

        <div className="mt-8 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/60 bg-card">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="flex flex-col gap-2 px-5 py-5 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="self-start shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium text-foreground/70">
                {a.tag}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[14px] font-semibold text-primary">
                  {a.title}
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground line-clamp-1">
                  {a.excerpt}
                </p>
              </div>
              <span className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">
                {a.date}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}