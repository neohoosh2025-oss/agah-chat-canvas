import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Send,
  Sparkles,
  MapPin,
  Store,
  TrendingUp,
  ShieldCheck,
  X,
  Check,
  ArrowLeft,
  Lock,
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  Phone,
  Building2,
  User as UserIcon,
  LogOut,
  MessageSquare,
  Settings,
  Plus,
  Compass,
  Wrench,
  BarChart3,
  Lightbulb,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "آگاه | مشاور هوشمند کسب‌وکار" },
      { name: "description", content: "آگاه، مشاور هوشمند کسب‌وکار شما برای تحلیل بازار، رقبا و فرصت‌ها در ایران." },
      { property: "og:title", content: "آگاه | مشاور هوشمند کسب‌وکار" },
      { property: "og:description", content: "تحلیل لحظه‌ای بازار، رقبا و فرصت‌های محله شما." },
    ],
  }),
  component: AgahApp,
});

/* ---------------------------------------------------------------- */
/* Types & helpers                                                  */
/* ---------------------------------------------------------------- */

type BusinessResult = {
  title: string;
  subtitle: string;
  countLabel: string;
  items: { name: string; address: string; status: string }[];
  approvals: string[];
  history: string[];
};

type Message =
  | { id: string; role: "assistant" | "user"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "card"; data: BusinessResult };

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const toFa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

type QuickPrompt = {
  icon: typeof BarChart3;
  title: string;
  hint: string;
  prompt: string;
  tone: "emerald" | "amber" | "indigo" | "rose";
};

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    icon: BarChart3,
    title: "عارضه‌یابی سریع مالی",
    hint: "نقاط ضعفِ سود و هزینه",
    prompt: "می‌خوام عارضه‌یابی مالی کسب‌وکارم رو شروع کنیم.",
    tone: "emerald",
  },
  {
    icon: Target,
    title: "رقبای فعالِ من کیست؟",
    hint: "تحلیل بازار محله",
    prompt: "رقبای فعال در محله من چه کسانی هستند؟",
    tone: "indigo",
  },
  {
    icon: Lightbulb,
    title: "ایدهٔ کم‌سرمایه",
    hint: "شروع با بودجه محدود",
    prompt: "یک ایده‌ کسب‌وکار کم‌سرمایه پیشنهاد بده.",
    tone: "amber",
  },
  {
    icon: Compass,
    title: "از کجا شروع کنم؟",
    hint: "نقشه‌راه شخصی",
    prompt: "نمی‌دونم از کجا شروع کنم، کمکم می‌کنی؟",
    tone: "rose",
  },
];

function useMediaQuery(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(q);
    const fn = () => setM(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [q]);
  return m;
}

const SAMPLE_RESULT: BusinessResult = {
  title: "تعداد موبایل‌فروشی‌های فعال",
  subtitle: "محله سعیدیه، همدان",
  countLabel: "واحد فعال",
  items: [
    { name: "موبایل ایران", address: "سعیدیه، خیابان شهید مفتح، پلاک ۱۲", status: "فعال" },
    { name: "گالری همراه پلاس", address: "بلوار ارم، نبش کوچه ۸", status: "فعال" },
    { name: "موبایل تک", address: "میدان سعیدیه، پاساژ نور، طبقه همکف", status: "فعال" },
    { name: "همراه شاپ", address: "خیابان میرزاده عشقی، پلاک ۴۸", status: "فعال" },
    { name: "موبایل آرین", address: "بلوار شهید بهشتی، روبروی بانک ملت", status: "فعال" },
    { name: "تک‌سل", address: "خیابان جهاد، پاساژ مرکزی، واحد ۷", status: "فعال" },
  ],
  approvals: [
    "تأیید اتحادیه صنف فروشندگان لوازم صوتی و تصویری",
    "مجوز فعالیت از اتاق اصناف همدان",
    "ثبت در سامانه جامع تجارت",
  ],
  history: [
    "میانگین رشد سالانه واحدها: ۸٪",
    "بیشترین تراکم در خیابان مفتح",
    "۳ واحد در ۶ ماه گذشته تعطیل شده‌اند",
  ],
};

/* ---------------------------------------------------------------- */
/* Root app                                                          */
/* ---------------------------------------------------------------- */

const INITIAL_MESSAGE: Message = {
  id: "m0",
  role: "assistant",
  kind: "text",
  text: "خب، با چه چالشی شروع کنیم؟ هرچی هست راحت بنویس، با هم بررسیش می‌کنیم. 🌱",
};

function AgahApp() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [freeTurns, setFreeTurns] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [sheetData, setSheetData] = useState<BusinessResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<{
    name?: string;
    business?: string;
    city?: string;
  }>({});

  // Tour: start hidden to avoid SSR hydration mismatch; enable after mount.
  const [tour, setTour] = useState<number>(-1);
  useEffect(() => {
    try {
      if (!localStorage.getItem("agah:tour")) setTour(0);
    } catch {}
  }, []);
  const closeTour = () => {
    setTour(-1);
    try { localStorage.setItem("agah:tour", "1"); } catch {}
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const userTurns = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages],
  );
  const isWelcome = userTurns === 0;
  const locked = !unlocked && freeTurns >= 4;
  useEffect(() => {
    if (locked && !signupOpen) setSignupOpen(true);
  }, [locked, signupOpen]);

  const handleSend = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    if (locked) { setSignupOpen(true); return; }
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", kind: "text", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    if (!unlocked) setFreeTurns((n) => n + 1);
    setThinking(true);

    window.setTimeout(() => {
      const wantsCard = /موبایل|فروش|رقیب|تعداد|بازار|محله|سعیدیه/.test(text);
      const reply: Message = wantsCard
        ? { id: crypto.randomUUID(), role: "assistant", kind: "card", data: SAMPLE_RESULT }
        : {
            id: crypto.randomUUID(),
            role: "assistant",
            kind: "text",
            text: "بررسی کردم 📊\nبرای پاسخ دقیق‌تر، یک محله یا شهر مشخص کن تا داده‌های رقبا و فرصت‌های همان منطقه را بررسی کنیم.",
          };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 900);
  };

  const newChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setThinking(false);
    setSidebarOpen(false);
  };

  const finishSignup = (p: { name: string; business?: string; city?: string }) => {
    setProfile(p);
    setUnlocked(true);
    setSignupOpen(false);
    const biz = p.business ? `«${p.business}»` : "کسب‌وکار شما";
    const city = p.city ? ` در ${p.city}` : "";
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        kind: "text",
        text: `${p.name} عزیز، خوش آمدی! 🎉\nاز این لحظه به بعد تحلیل‌ها برای ${biz}${city} شخصی‌سازی می‌شوند. بریم سراغ اولین تحلیل اختصاصی؟`,
      },
    ]);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[oklch(0.97_0.01_247)] to-[oklch(0.94_0.015_248)] text-foreground">
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-stretch justify-center gap-5 px-0 lg:px-6 lg:py-6">
        {isDesktop && (
          <DesktopSidebar
            profile={profile}
            unlocked={unlocked}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
            onNewChat={newChat}
          />
        )}

        <div
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden bg-card",
            "lg:max-w-[760px] lg:flex-1 lg:rounded-[28px] lg:border lg:border-border lg:shadow-[var(--shadow-island)]",
          )}
        >
          <Header
            onMenu={() => setSidebarOpen(true)}
            onNewChat={newChat}
            showMobileControls={!isDesktop}
            highlightMenu={tour === 2}
          />

          <div ref={scrollRef} className="agah-scroll flex-1 overflow-y-auto px-4 pb-36 pt-4">
            <div className="mx-auto flex max-w-xl flex-col gap-3">
              {isWelcome ? (
                <WelcomeScreen
                  onPrompt={(p) => handleSend(p)}
                  highlightPrompts={tour === 1}
                />
              ) : (
                <>
                  {messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      onOpenDetails={(d) => setSheetData(d)}
                    />
                  ))}
                  {thinking && <TypingBubble />}
                  {locked && <LockedNotice onSignup={() => setSignupOpen(true)} />}
                </>
              )}
            </div>
          </div>

          <Composer
            input={input}
            setInput={setInput}
            onSend={() => handleSend()}
            locked={locked}
            highlightInput={tour === 0}
          />

          {tour >= 0 && tour <= 2 && (
            <TourOverlay step={tour} setStep={setTour} close={closeTour} />
          )}
        </div>
      </div>

      {!isDesktop && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-[86%] max-w-sm border-0 p-0">
            <MobileSidebar
              profile={profile}
              unlocked={unlocked}
              onNewChat={newChat}
              onSignup={() => { setSidebarOpen(false); setSignupOpen(true); }}
              onClose={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {!isDesktop ? (
        <Sheet open={!!sheetData} onOpenChange={(o) => !o && setSheetData(null)}>
          <SheetContent side="bottom" className="max-h-[88dvh] overflow-hidden rounded-t-[28px] border-0 p-0">
            {sheetData && <DetailsView data={sheetData} onClose={() => setSheetData(null)} />}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!sheetData} onOpenChange={(o) => !o && setSheetData(null)}>
          <DialogContent className="max-w-lg overflow-hidden rounded-3xl p-0">
            {sheetData && <DetailsView data={sheetData} onClose={() => setSheetData(null)} desktop />}
          </DialogContent>
        </Dialog>
      )}

      <SignupFlow
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onFinish={finishSignup}
        forced={locked}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Header                                                            */
/* ---------------------------------------------------------------- */

function Header({
  onMenu,
  onNewChat,
  showMobileControls,
  highlightMenu,
}: {
  onMenu: () => void;
  onNewChat: () => void;
  showMobileControls: boolean;
  highlightMenu: boolean;
}) {
  return (
    <header className="relative z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-card/85 px-4 py-3 backdrop-blur-md">
      {/* In RTL the first grid column renders on the right (start) */}
      {showMobileControls ? (
        <button
          onClick={onMenu}
          aria-label="منو"
          className={cn(
            "relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-secondary/60 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95",
            highlightMenu && "agah-pulse ring-2 ring-accent",
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : (
        <span className="h-10 w-10" aria-hidden />
      )}

      <div className="flex items-center justify-center gap-2 min-w-0">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[oklch(0.85_0.16_165)]" />
        </span>
        <h1 className="truncate text-[17px] font-extrabold tracking-tight text-primary">آگاه</h1>
      </div>

      {showMobileControls ? (
        <button
          onClick={onNewChat}
          aria-label="گفتگوی جدید"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-secondary/60 text-primary transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : (
        <span className="h-10 w-10" aria-hidden />
      )}
    </header>
  );
}

/* ---------------------------------------------------------------- */
/* Welcome Screen                                                    */
/* ---------------------------------------------------------------- */

const TONE_BG: Record<QuickPrompt["tone"], string> = {
  emerald: "bg-[oklch(0.96_0.04_165)] text-[oklch(0.4_0.13_165)]",
  amber: "bg-[oklch(0.96_0.05_85)] text-[oklch(0.45_0.13_75)]",
  indigo: "bg-[oklch(0.95_0.03_265)] text-[oklch(0.4_0.13_265)]",
  rose: "bg-[oklch(0.95_0.04_15)] text-[oklch(0.5_0.15_15)]",
};

function WelcomeScreen({
  onPrompt,
  highlightPrompts,
}: {
  onPrompt: (p: string) => void;
  highlightPrompts: boolean;
}) {
  return (
    <div className="agah-fade-up flex flex-col items-center pt-2 pb-2">
      {/* Hero badge */}
      <div className="relative mb-5">
        <span className="absolute -inset-4 rounded-full bg-accent/15 blur-2xl" aria-hidden />
        <div className="relative grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-primary to-[oklch(0.28_0.06_265)] text-primary-foreground shadow-[0_18px_40px_-12px_oklch(0.21_0.04_265/0.45)]">
          <Sparkles className="h-9 w-9 text-[oklch(0.85_0.16_165)]" />
          <span className="absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-4 border-card bg-accent" aria-hidden />
        </div>
      </div>

      <h2 className="text-[22px] font-black tracking-tight text-primary">
        سلام، من <span className="text-accent">آگاه</span>‌ام 👋
      </h2>
      <p className="mt-2 max-w-[300px] text-center text-[13px] leading-7 text-muted-foreground">
        مشاور هوشمندِ همراهت برای رشد کسب‌وکار.
        راحت و دوستانه بنویس، با هم می‌سازیمش.
      </p>

      <div className="mt-6 mb-3 flex w-full items-center gap-3 px-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-bold text-muted-foreground">از کجا شروع کنیم؟</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div
        className={cn(
          "grid w-full grid-cols-2 gap-2.5 rounded-3xl p-1 transition-all duration-300",
          highlightPrompts && "agah-pulse ring-2 ring-accent",
        )}
      >
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.title}
            onClick={() => onPrompt(q.prompt)}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-3 text-right shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[var(--shadow-island)] active:scale-[0.98]"
          >
            <span className={cn("grid h-9 w-9 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110", TONE_BG[q.tone])}>
              <q.icon className="h-4 w-4" />
            </span>
            <span className="text-[12.5px] font-extrabold leading-5 text-primary">{q.title}</span>
            <span className="text-[10.5px] leading-4 text-muted-foreground">{q.hint}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 text-center text-[10.5px] text-muted-foreground">
        یا مستقیماً سؤالت رو پایین تایپ کن ↓
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Messages                                                          */
/* ---------------------------------------------------------------- */

function MessageBubble({
  message,
  onOpenDetails,
}: {
  message: Message;
  onOpenDetails: (d: BusinessResult) => void;
}) {
  if (message.kind === "card") {
    return (
      <div className="agah-fade-up flex justify-start">
        <ResultCard data={message.data} onOpen={() => onOpenDetails(message.data)} />
      </div>
    );
  }
  const isUser = message.role === "user";
  return (
    <div className={cn("agah-fade-up flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14px] leading-7 transition-all duration-300",
          isUser
            ? "rounded-bl-md bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
            : "text-foreground",
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="agah-fade-up flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl px-1 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="agah-dot inline-block h-1.5 w-1.5 rounded-full bg-accent"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ data, onOpen }: { data: BusinessResult; onOpen: () => void }) {
  return (
    <div className="w-full max-w-[92%] overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-island)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_oklch(0.21_0.04_265/0.22)]">
      <div className="flex items-start gap-3 border-b border-border bg-secondary/60 px-4 py-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-bold text-primary">{data.title}</h3>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{data.subtitle}</span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 px-4 py-5">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{data.countLabel}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[40px] font-black leading-none text-accent">{toFa(data.items.length * 2)}</span>
            <span className="text-sm font-semibold text-primary">واحد</span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
          <TrendingUp className="h-3 w-3" />
          <span>{toFa(8)}٪ رشد</span>
        </div>
      </div>
      <button
        onClick={onOpen}
        className="group flex w-full items-center justify-center gap-2 border-t border-border bg-primary px-4 py-3.5 text-[13px] font-bold text-primary-foreground transition-all duration-300 hover:bg-[oklch(0.27_0.05_265)] active:scale-[0.99]"
      >
        <Search className="h-4 w-4 text-accent" />
        <span>مشاهده لیست و آدرس‌های متنی</span>
        <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Composer                                                          */
/* ---------------------------------------------------------------- */

function Composer({
  input,
  setInput,
  onSend,
  locked,
  highlightInput,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  locked: boolean;
  highlightInput: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
      <div className="pointer-events-auto bg-gradient-to-t from-card via-card/95 to-transparent px-3 pb-4 pt-8">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-[var(--shadow-island)] transition-all duration-300 focus-within:border-accent focus-within:shadow-[0_14px_34px_-14px_oklch(0.72_0.17_165/0.45)]",
            highlightInput && "agah-pulse ring-2 ring-accent",
            locked && "opacity-80",
          )}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={locked ? "برای ادامه ثبت‌نام کنید…" : "از آگاه بپرس…"}
            disabled={locked}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
            dir="rtl"
          />
          <button
            onClick={onSend}
            disabled={locked || !input.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_6px_18px_-4px_oklch(0.72_0.17_165/0.55)] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {locked ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4 -rotate-180 rtl:rotate-0" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          آگاه می‌تواند اشتباه کند. تصمیم نهایی همیشه با شماست.
        </p>
      </div>
    </div>
  );
}

function LockedNotice({ onSignup }: { onSignup: () => void }) {
  return (
    <div className="agah-fade-up mt-2 rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-5 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="text-base font-extrabold text-primary">۴ سوال رایگان شما تمام شد</h3>
      <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">
        برای ادامه گفتگو و دریافت تحلیل اختصاصی کسب‌وکار، در کمتر از ۳۰ ثانیه ثبت‌نام کنید.
      </p>
      <button
        onClick={onSignup}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        ثبت‌نام رایگان
        <ArrowLeft className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Details view                                                      */
/* ---------------------------------------------------------------- */

function DetailsView({ data, onClose, desktop }: { data: BusinessResult; onClose: () => void; desktop?: boolean }) {
  return (
    <div className="flex max-h-[88dvh] flex-col bg-card">
      {!desktop && (
        <button
          onClick={onClose}
          className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-border transition-colors hover:bg-muted-foreground"
          aria-label="بستن"
        />
      )}
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold text-primary">{data.title}</h2>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{data.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="agah-scroll flex-1 space-y-5 overflow-y-auto px-5 pb-8">
        <Section icon={<Store className="h-4 w-4" />} title="لیست واحدهای فعال">
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-secondary/50">
            {data.items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 bg-card/60 p-3.5 transition-colors hover:bg-secondary/70">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-[11px] font-bold text-accent">{toFa(i + 1)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-bold text-primary">{it.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {it.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
                    <MapPin className="ml-1 inline h-3 w-3" />
                    {it.address}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-4 w-4" />} title="مجوزها و تأییدیه‌ها">
          <ul className="space-y-2">
            {data.approvals.map((a) => (
              <li key={a} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-[12.5px] text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<History className="h-4 w-4" />} title="سابقه و روند بازار">
          <ul className="space-y-2">
            {data.history.map((h) => (
              <li key={h} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-[12.5px] text-foreground">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">{icon}</span>
        <h4 className="text-[13px] font-bold text-primary">{title}</h4>
      </div>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Sidebars                                                          */
/* ---------------------------------------------------------------- */

function DesktopSidebar({
  profile,
  unlocked,
  collapsed,
  onToggle,
  onNewChat,
}: {
  profile: { name?: string; business?: string; city?: string };
  unlocked: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}) {
  return (
    <aside
      className={cn(
        "relative hidden h-full shrink-0 flex-col rounded-[28px] border border-border bg-card shadow-[var(--shadow-island)] transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[76px] p-3" : "w-[260px] p-5",
      )}
    >
      <button
        onClick={onToggle}
        aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
        className="absolute -left-3 top-7 z-10 grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-105 hover:text-primary"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
      <SidebarBody profile={profile} unlocked={unlocked} collapsed={collapsed} onNewChat={onNewChat} />
    </aside>
  );
}

function MobileSidebar({
  profile,
  unlocked,
  onNewChat,
  onSignup,
  onClose,
}: {
  profile: { name?: string; business?: string; city?: string };
  unlocked: boolean;
  onNewChat: () => void;
  onSignup: () => void;
  onClose: () => void;
}) {
  const history = unlocked
    ? [
        { title: "تحلیل موبایل‌فروشی‌های سعیدیه", time: "امروز" },
        { title: "عارضه‌یابی کافه مهتاب", time: "دیروز" },
        { title: "ایده‌های کم‌سرمایه برای همدان", time: "۳ روز پیش" },
      ]
    : [];

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-card to-secondary/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4 text-[oklch(0.85_0.16_165)]" />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold text-primary leading-tight">آگاه</div>
            <div className="truncate text-[10.5px] text-muted-foreground">مشاور هوشمند کسب‌وکار</div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="بستن"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* New chat CTA */}
      <div className="px-4 pt-4">
        <button
          onClick={onNewChat}
          className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-[var(--shadow-island)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-[13.5px] font-extrabold">گفتگوی جدید</span>
          </span>
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </button>
      </div>

      {/* Tools */}
      <div className="px-4 pt-5">
        <div className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">ابزارها</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: BarChart3, label: "عارضه‌یابی" },
            { icon: Target, label: "تحلیل رقبا" },
            { icon: Wrench, label: "سیستم‌سازی" },
            { icon: Compass, label: "نقشه راه" },
          ].map((t) => (
            <button
              key={t.label}
              className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-3 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[var(--shadow-soft)] active:scale-[0.98]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                <t.icon className="h-4 w-4" />
              </span>
              <span className="text-[12px] font-bold text-primary">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="agah-scroll flex-1 overflow-y-auto px-4 pt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">تاریخچه گفتگوها</span>
          {history.length > 0 && (
            <button className="text-[10.5px] font-medium text-accent hover:underline">همه</button>
          )}
        </div>
        {history.length > 0 ? (
          <ul className="space-y-1.5">
            {history.map((h, i) => (
              <li key={i}>
                <button className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-right transition-colors hover:bg-secondary">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-primary">{h.title}</span>
                    <span className="block text-[10px] text-muted-foreground">{h.time}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center">
            <History className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-[11.5px] leading-5 text-muted-foreground">
              با ثبت‌نام، تاریخچه گفتگوهات اینجا ذخیره می‌شه.
            </p>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="border-t border-border/60 bg-card/60 px-4 py-3">
        {unlocked ? (
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground font-bold">
              {profile.name?.[0] ?? "آ"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-bold text-primary">{profile.name}</div>
              <div className="truncate text-[10.5px] text-muted-foreground">
                {profile.business ?? "کسب‌وکار ثبت نشده"}
                {profile.city ? ` · ${profile.city}` : ""}
              </div>
            </div>
            <button
              aria-label="تنظیمات"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignup}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-right transition-all duration-300 hover:bg-accent/15 active:scale-[0.99]"
          >
            <span className="min-w-0">
              <span className="block text-[12.5px] font-extrabold text-primary">ثبت‌نام رایگان</span>
              <span className="block text-[10.5px] text-muted-foreground">برای ذخیره گفتگوها و تحلیل اختصاصی</span>
            </span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <ArrowLeft className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarBody({
  profile,
  unlocked,
  collapsed = false,
  onNewChat,
}: {
  profile: { name?: string; business?: string; city?: string };
  unlocked: boolean;
  collapsed?: boolean;
  onNewChat: () => void;
}) {
  const items = [
    { icon: MessageSquare, label: "گفتگوی جاری", active: true },
    { icon: History, label: "تاریخچهٔ تحلیل‌ها" },
    { icon: Building2, label: "پروفایل کسب‌وکار" },
    { icon: Settings, label: "تنظیمات" },
  ];
  return (
    <>
      <div className={cn("flex items-center gap-3 pb-4", collapsed && "justify-center")}>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5 text-[oklch(0.85_0.16_165)]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-base font-extrabold text-primary">آگاه</div>
            <div className="truncate text-[11px] text-muted-foreground">مشاور هوشمند کسب‌وکار</div>
          </div>
        )}
      </div>

      <button
        onClick={onNewChat}
        title={collapsed ? "گفتگوی جدید" : undefined}
        className={cn(
          "mb-2 flex items-center gap-2 rounded-2xl bg-primary py-2.5 text-[13px] font-extrabold text-primary-foreground transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]",
          collapsed ? "justify-center px-0" : "justify-center px-3",
        )}
      >
        <Plus className="h-4 w-4" />
        {!collapsed && <span>گفتگوی جدید</span>}
      </button>

      <nav className="mt-2 flex flex-col gap-1">
        {items.map((it) => (
          <button
            key={it.label}
            title={collapsed ? it.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-all duration-300",
              collapsed ? "justify-center px-0" : "px-3",
              it.active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary hover:text-primary",
            )}
          >
            <it.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{it.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-auto rounded-2xl border border-border bg-secondary/60 p-4">
          {unlocked ? (
            <>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground font-bold">
                  {profile.name?.[0] ?? "آ"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-primary">{profile.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {profile.business ?? "کسب‌وکار ثبت نشده"}
                    {profile.city ? ` · ${profile.city}` : ""}
                  </div>
                </div>
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-destructive">
                <LogOut className="h-3.5 w-3.5" />
                خروج از حساب
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="text-[12px] font-bold text-primary">هنوز ثبت‌نام نکرده‌اید</div>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                با ثبت‌نام، تحلیل اختصاصی کسب‌وکار خود را دریافت کنید.
              </p>
            </div>
          )}
        </div>
      )}
      {collapsed && unlocked && (
        <div className="mt-auto grid h-10 w-10 self-center place-items-center rounded-full bg-accent text-accent-foreground font-bold">
          {profile.name?.[0] ?? "آ"}
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Onboarding tour                                                   */
/* ---------------------------------------------------------------- */

function TourOverlay({
  step,
  setStep,
  close,
}: {
  step: number;
  setStep: (n: number) => void;
  close: () => void;
}) {
  const tips = [
    {
      icon: "🧠",
      title: "اتاق مشاوره شخصی شما",
      body: "نیازی به فرمول‌ها یا کلمات سخت حقوقی نیست؛ هر چالشی که در کسب‌وکارت داری — از ترسِ شروع کار تا قیمت‌گذاری یا رکود بازار — به زبان ساده و معمولی اینجا بنویس تا با هم بررسی‌اش کنیم.",
      pos: "bottom-32",
      cta: "بعدی",
    },
    {
      icon: "🛠️",
      title: "سلاح‌های کارآفرینی",
      body: "اگر در شروع گفتگو تردید داری یا نمی‌دانی از کجا شروع کنی، این ابزارهای آماده را برای سنجش رقبا و عارضه‌یابی مالی برایت ساخته‌ام؛ فقط کافی است روی یکی از آن‌ها بزنی تا گفتگو شروع شود.",
      pos: "top-1/2 -translate-y-1/2",
      cta: "بعدی",
    },
    {
      icon: "📁",
      title: "میز کار و تاریخچه شما",
      body: "با ثبت‌نام و فعال‌سازی این بخش، تمام چک‌لیست‌های سیستم‌سازی، گزارش‌های مالی و تاریخچه گفتگوهای عارضه‌یابی شما در این منو ذخیره می‌شوند تا هر زمان خواستی به آن‌ها دسترسی داشته باشی.",
      pos: "top-20",
      cta: "شروع گفت‌وگو با آگاه 🚀",
    },
  ];
  const t = tips[step];
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-primary/55 backdrop-blur-[3px]" onClick={close} />
      <div
        className={cn(
          "agah-fade-up absolute inset-x-4 z-50 mx-auto max-w-sm rounded-3xl border border-border bg-card p-5 shadow-[0_24px_60px_-20px_oklch(0.21_0.04_265/0.5)]",
          t.pos,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.28_0.06_265)] text-[20px] shadow-md">
            <span>{t.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[14px] font-extrabold text-primary">{t.title}</h4>
              <span className="text-[10px] font-medium text-muted-foreground">
                {toFa(step + 1)} از {toFa(3)}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-7 text-muted-foreground">{t.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={close}
                className="text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                رد کردن
              </button>
              <button
                onClick={() => (step < 2 ? setStep(step + 1) : close())}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground transition-all hover:scale-[1.03] active:scale-95"
              >
                {t.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Signup flow                                                       */
/* ---------------------------------------------------------------- */

function SignupFlow({
  open,
  onOpenChange,
  onFinish,
  forced,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onFinish: (p: { name: string; business?: string; city?: string }) => void;
  forced: boolean;
}) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [field, setField] = useState("");
  const [generatedOtp] = useState("۱۲۳۴");

  const stage1Valid = useMemo(
    () => name.trim().length >= 2 && /^\d{10,11}$/.test(phone) && password.length >= 4,
    [name, phone, password],
  );
  const otpValid = otp.join("") === "1234";

  const handleClose = (o: boolean) => {
    if (forced && !o) return;
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-border p-0">
        <div className="bg-gradient-to-br from-primary to-[oklch(0.28_0.05_265)] px-6 pb-6 pt-7 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
              {stage === 1 ? <UserIcon className="h-5 w-5" /> :
               stage === 2 ? <Phone className="h-5 w-5" /> :
               <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <DialogHeader className="space-y-0 text-right">
                <DialogTitle className="text-base font-extrabold text-primary-foreground">
                  {stage === 1 ? "ثبت‌نام در آگاه" : stage === 2 ? "تأیید شماره موبایل" : "معرفی کسب‌وکار شما"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[11.5px] text-primary-foreground/70">
                  {stage === 1 && "مرحلهٔ ۱ از ۲ — اطلاعات ضروری"}
                  {stage === 2 && "کد ۴ رقمی ارسال شده را وارد کنید"}
                  {stage === 3 && "مرحلهٔ ۲ از ۲ — اختیاری ولی توصیه‌شده"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  s <= stage ? "bg-accent" : "bg-primary-foreground/15",
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          {stage === 1 && (
            <div className="space-y-3">
              <Field label="نام و نام خانوادگی">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: محمد رضایی" className="signup-input" dir="rtl" />
              </Field>
              <Field label="شماره موبایل">
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="09123456789" className="signup-input" dir="ltr" />
              </Field>
              <Field label="رمز عبور">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۴ کاراکتر" className="signup-input" />
              </Field>
              <button onClick={() => setStage(2)} disabled={!stage1Valid} className="signup-btn">
                ارسال کد تأیید
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {stage === 2 && (
            <div className="space-y-4">
              <p className="rounded-xl bg-accent/10 px-3 py-2 text-center text-[12px] font-medium text-accent">
                کد آزمایشی شما: <span className="font-extrabold">{generatedOtp}</span>
              </p>
              <div className="flex items-center justify-center gap-2" dir="ltr">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    value={v}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otp];
                      next[i] = d;
                      setOtp(next);
                      if (d && i < 3) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0)
                        otpRefs.current[i - 1]?.focus();
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-14 w-12 rounded-2xl border-2 border-border bg-card text-center text-xl font-extrabold text-primary outline-none transition-all duration-300 focus:border-accent focus:shadow-[0_0_0_4px_oklch(0.72_0.17_165/0.18)]"
                  />
                ))}
              </div>
              <button onClick={() => setStage(3)} disabled={!otpValid} className="signup-btn">
                تأیید و ادامه
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => setStage(1)} className="block w-full text-center text-[11.5px] text-muted-foreground transition-colors hover:text-primary">
                ویرایش شماره موبایل
              </button>
            </div>
          )}

          {stage === 3 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-[11.5px] leading-6 text-foreground">
                ✨ با تکمیل این مرحله، تحلیل‌ها بر اساس <b>کسب‌وکار</b> و <b>شهر</b> شما شخصی‌سازی می‌شود.
              </div>
              <Field label="نام کسب‌وکار">
                <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="مثلاً: کافه مهتاب" className="signup-input" dir="rtl" />
              </Field>
              <Field label="شهر و استان">
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثلاً: همدان، همدان" className="signup-input" dir="rtl" />
              </Field>
              <Field label="حوزه فعالیت">
                <input value={field} onChange={(e) => setField(e.target.value)} placeholder="مثلاً: کافه و رستوران" className="signup-input" dir="rtl" />
              </Field>
              <div className="flex gap-2 pt-1">
                <button onClick={() => onFinish({ name })} className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-[13px] font-bold text-muted-foreground transition-all hover:text-primary">
                  فعلاً رد می‌کنم
                </button>
                <button onClick={() => onFinish({ name, business: business.trim() || undefined, city: city.trim() || undefined })} className="signup-btn flex-1">
                  تکمیل و ورود
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] font-bold text-primary">{label}</span>
      {children}
    </label>
  );
}
