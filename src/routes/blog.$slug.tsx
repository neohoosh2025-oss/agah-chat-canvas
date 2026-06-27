import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ARTICLES, getArticle } from "@/lib/articles";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} | مجله آگاه` },
          { name: "description", content: loaderData.article.excerpt },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.excerpt },
        ]
      : [{ title: "مجله آگاه" }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-[100dvh] items-center justify-center px-5">
      <div className="text-center">
        <h1 className="text-[20px] font-bold text-primary">مطلب پیدا نشد</h1>
        <Link
          to="/blog"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-accent"
        >
          بازگشت به مجله
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-[100dvh] items-center justify-center px-5">
      <p className="text-[13px] text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <ArrowRight className="size-4" />
            مجله آگاه
          </Link>
          <Link to="/" className="text-[13px] font-bold text-primary">
            آگاه
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-5 py-10 lg:py-16">
        <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium text-foreground/70">
            {article.tag}
          </span>
          <span className="tabular-nums">{article.date}</span>
        </div>

        <h1 className="mt-4 text-[26px] lg:text-[34px] font-extrabold leading-tight tracking-tight text-primary">
          {article.title}
        </h1>

        <p className="mt-4 text-[14px] leading-relaxed text-foreground/80">
          {article.excerpt}
        </p>

        <div className="mt-8 space-y-5 text-[14px] leading-[1.95] text-foreground/85">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-14 border-t border-border/60 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              مطالب مرتبط
            </p>
            <div className="mt-4 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/60 bg-card">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  to="/blog/$slug"
                  params={{ slug: a.slug }}
                  className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/50"
                >
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium text-foreground/70">
                    {a.tag}
                  </span>
                  <span className="flex-1 truncate text-[13.5px] font-medium text-primary">
                    {a.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border/60 bg-card px-6 py-8 text-center">
          <p className="text-[14px] font-semibold text-primary">
            سؤالی درباره کسب‌وکار خودت داری؟
          </p>
          <Link
            to="/chat"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            از آگاه بپرس
          </Link>
        </div>
      </article>
    </div>
  );
}