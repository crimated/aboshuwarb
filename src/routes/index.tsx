import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { Logo, Modal, Shell } from "@/components/Shell";
import { openDeepLink, SHOP_WA, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حلويات ابو شوارب | الموصل" },
      { name: "description", content: "حلويات شرقية فاخرة في الموصل. تصفح المنيو، مواقع الفروع، وتواصل معنا." },
      { property: "og:title", content: "حلويات ابو شوارب" },
      { property: "og:description", content: "حلويات شرقية فاخرة في الموصل." },
    ],
  }),
  component: Home,
});

const branches = [
  { name: "فرع الفيصلية", addr: "الموصل - الفيصلية - مقابل مديرية التربية", url: "https://maps.app.goo.gl/Y6Eeu5kYo1peWHp98?g_st=ic" },
  { name: "فرع الغابات", addr: "الموصل - الغابات - داخل مول آشور", url: "https://maps.app.goo.gl/PxZUZyMFKZ4B2Vk69?g_st=ic" },
];
const phones = ["07711221123", "07510221123"];
const FB = "https://www.facebook.com/share/1BsVa5DhGY/?mibextid=wwXIfr";

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0"><path d="M10 3L5 8l5 5" /></svg>
);

function Row({ label, value, href, onClick, ext }: { label: string; value: string; href?: string; onClick?: () => void; ext?: boolean }) {
  const cls = "group flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/60 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-lux";
  const body = (
    <>
      <div className="text-right">
        <div className="font-bold text-primary">{label}</div>
        <div className="mt-0.5 text-sm text-muted-foreground" dir={value.match(/^\d/) ? "ltr" : undefined}>{value}</div>
      </div>
      <span className="text-gold transition-transform group-hover:-translate-x-1"><Arrow /></span>
    </>
  );
  return href ? <a href={href} target={ext ? "_blank" : undefined} rel="noreferrer" className={cls}>{body}</a> : <button onClick={onClick} className={`${cls} w-full`}>{body}</button>;
}

function Home() {
  const [modal, setModal] = useState<"" | "loc" | "contact">("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { videoUrl } = useStore();

  const openMenu = () => {
    setLoading(true);
    setTimeout(() => navigate({ to: "/menu" }), 2500);
  };

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-lux-lg">
          <img src={hero} alt="تشكيلة حلويات ابو شوارب" width={1200} height={912} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/20" />
          <div className="relative flex min-h-[560px] flex-col items-center justify-end px-6 pb-10 pt-16 text-center text-primary-foreground sm:min-h-[620px]">
            <div className="mb-5 rounded-full bg-card/95 p-3 shadow-lux-lg">
              <Logo className="h-20 w-20" size={80} />
            </div>
            <span className="eyebrow">MOSUL · SINCE GENERATIONS</span>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">حلويات ابو شوارب</h1>
            <p className="mt-3 max-w-sm text-primary-foreground/85">فن الحلويات الأصيلة، تُصنع يومياً بأجود المكونات</p>
            <div className="mt-8 grid w-full max-w-sm gap-3">
              <button onClick={openMenu} className="inline-flex items-center justify-center rounded-2xl bg-card px-6 py-4 text-lg font-bold text-primary shadow-lux-lg transition-all duration-300 hover:-translate-y-0.5">
                المنيو
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-ghost-light" onClick={() => setModal("loc")}>موقع المحل</button>
                <button className="btn-ghost-light" onClick={() => setModal("contact")}>تواصل معنا</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl grid-cols-3 gap-3 px-4 text-center sm:px-6">
        {[["طازجة يومياً", "تحضير يومي"], ["مكونات فاخرة", "فستق وسمن عربي"], ["فرعان", "في الموصل"]].map(([a, b]) => (
          <div key={a} className="card px-2 py-5">
            <div className="font-bold text-primary">{a}</div>
            <div className="mt-1 text-xs text-muted-foreground">{b}</div>
          </div>
        ))}
      </section>

      <Modal open={modal === "loc"} onClose={() => setModal("")} title="فروعنا">
        <div className="space-y-3">
          {branches.map((b) => <Row key={b.name} label={b.name} value={b.addr} href={b.url} ext />)}
        </div>
      </Modal>

      <Modal open={modal === "contact"} onClose={() => setModal("")} title="تواصل معنا">
        <div className="space-y-3">
          {phones.map((p) => <Row key={p} label="اتصال هاتفي" value={p} href={`tel:${p}`} />)}
          <Row label="واتساب" value="راسلنا مباشرة" href={`https://wa.me/${SHOP_WA}`} ext />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="btn-outline" onClick={() => openDeepLink("instagram://user?username=abo.shuwarb", "https://instagram.com/abo.shuwarb")}>انستغرام</button>
            <button className="btn-outline" onClick={() => openDeepLink(`fb://facewebmodal/f?href=${FB}`, FB)}>فيسبوك</button>
          </div>
        </div>
      </Modal>

      {loading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-primary animate-in fade-in duration-300">
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay
            muted
            playsInline
            className="w-72 rounded-2xl shadow-lux-lg sm:w-96"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              document.getElementById("loading-logo-fallback")?.classList.remove("hidden");
            }}
          />
          <span id="loading-logo-fallback" className="hidden">
            <Logo className="h-28 w-28 rounded-2xl bg-card p-3" size={112} />
          </span>
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-primary-foreground/20">
            <div className="h-full origin-right bg-gold" style={{ animation: "grow 2.5s linear forwards" }} />
          </div>
        </div>
      )}
    </Shell>
  );
}
