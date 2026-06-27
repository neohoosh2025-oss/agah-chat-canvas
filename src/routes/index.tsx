import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import banner from "../../public/images/baner.png";
import { ARTICLES } from "@/lib/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "آگاه | دستیار هوشمند کسب‌وکار" },
      {
        name: "description",
        content:
          "آگاه، مشاور هوشمندی که شب و روز کنار کسب‌وکار توست؛ تحلیل بازار، مجوزها و مسیر رشد فروش.",
      },
      { property: "og:title", content: "آگاه | دستیار هوشمند کسب‌وکار" },
      {
        property: "og:description",
        content: "وقتی تو خوابی، آگاه به فکر کسب‌وکارته.",
      },
      { property: "og:image", content: "/images/baner.png" },
    ],
  }),
  component: LandingPage,
});

const SUGGESTIONS = [
  "تحلیل رقبای محله من",
  "مدارک مجوز کسب",
  "مشاوره افزایش فروش",
];

const FEATURES: { icon: typeof BarChart3; title: string; desc: string }[] = [
  {
    icon: BarChart3,
    title: "تحلیل رقبا",
    desc: "تصویری شفاف از بازار محله‌ات در چند ثانیه.",
  },
  {
    icon: FileText,
    title: "مجوز و مدارک",
    desc: "فهرست دقیق چیزهایی که باید آماده کنی.",
  },
  {
    icon: TrendingUp,
    title: "رشد فروش",
    desc: "پیشنهادهای عملی متناسب با صنف تو.",
  },
  {
    icon: Clock,
    title: "همیشه در دسترس",
    desc: "شبانه‌روز، بدون نوبت، بدون انتظار.",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const goToChat = (q?: string) => {
    const text = (q ?? query).trim();
    navigate({ to: "/chat", search: text ? { q: text } : {} });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToChat();
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="text-[17px] font-extrabold tracking-tight text-primary">
            آگاه
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ورود به دستیار
            <ArrowLeft className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex min-h-[calc(100dvh-3.5rem)] items-center px-5 py-10">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <img
            src={banner}
            alt="آگاه — مشاور هوشمند کسب‌وکار"
            width={1280}
            height={704}
            className="mx-auto w-full max-h-[250px] lg:max-h-[350px] rounded-2xl border border-border/60 object-cover"
          />

          <h1 className="text-center text-[26px] lg:text-[36px] font-extrabold leading-tight tracking-tight text-primary">
            وقتی تو خوابی،
            <br className="lg:hidden" />
            <span className="lg:mr-2"> آگاه به فکر کسب‌وکارته.</span>
          </h1>

          <form
            onSubmit={onSubmit}
            className="relative mx-auto w-full max-w-xl"
            dir="rtl"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="از دستیار بپرس..."
              className="h-14 w-full rounded-full border border-border bg-card pr-6 pl-16 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/15"
            />
            <button
              type="submit"
              aria-label="ارسال"
              className="absolute left-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => goToChat(s)}
                className="rounded-full border border-border/70 bg-card px-4 py-2 text-[12.5px] text-foreground/80 transition-colors hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + MAGAZINE */}
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-5xl space-y-20 px-5 py-20">
          {/* Why Agah */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                چرا آگاه؟
              </p>
              <h2 className="mt-3 text-[20px] lg:text-[26px] font-bold text-primary">
                ساده، آرام، در کنار تو.
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/60 bg-card p-5"
                >
                  <Icon className="size-5 text-accent" />
                  <h3 className="mt-3 text-[14px] font-semibold text-primary">
                    {title}
                  </h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Magazine */}
          <div className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  مجله آگاه
                </p>
                <h2 className="mt-2 text-[20px] lg:text-[24px] font-bold text-primary">
                  خواندنی‌های تازه
                </h2>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent transition-colors hover:text-accent/80"
              >
                همه مطالب
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/60 bg-card">
              {ARTICLES.slice(0, 3).map((a) => (
                <Link
                  key={a.slug}
                  to="/blog/$slug"
                  params={{ slug: a.slug }}
                  className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/50 lg:px-5"
                >
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium text-foreground/70">
                    {a.tag}
                  </span>
                  <span className="flex-1 truncate text-[13.5px] font-medium text-primary">
                    {a.title}
                  </span>
                  <span className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">
                    {a.date}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-border/60 bg-card px-6 py-12 text-center">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-primary">
              همین حالا اولین سؤالت را بپرس.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-muted-foreground">
              آگاه از همان دقیقه اول کنارت است. بدون ثبت‌نام، بدون پیچیدگی.
            </p>
            <button
              onClick={() => goToChat()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              همین الان شروع کن
              <ArrowLeft className="size-4" />
            </button>
          </div>

          <p className="text-center text-[11.5px] text-muted-foreground">
            آگاه — دستیار هوشمند کسب‌وکار شما
          </p>
        </div>
      </section>
    </div>
  );
}