import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Drawer, Modal, Shell } from "@/components/Shell";
import { formatPrice, resolveImage, SHOP_WA, useStore, type Item } from "@/lib/store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "المنيو | حلويات ابو شوارب" },
      { name: "description", content: "تصفح منيو حلويات ابو شوارب واطلب مباشرة عبر واتساب." },
      { property: "og:title", content: "المنيو | حلويات ابو شوارب" },
      { property: "og:description", content: "بقلاوة، كنافة، معمول وأكثر." },
    ],
  }),
  component: Menu,
});

function Menu() {
  const { data, cart, setQty, clearCart } = useStore();
  const [active, setActive] = useState<string>("all");
  const [zoom, setZoom] = useState<Item | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const items = active === "all" ? data.items : data.items.filter((i) => i.categoryId === active);
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ item: data.items.find((i) => i.id === id)!, qty }))
    .filter((l) => l.item);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = [
      "طلب جديد - حلويات ابو شوارب",
      "",
      ...lines.map((l) => `- ${l.item.title} × ${l.qty} = ${formatPrice(l.item.price * l.qty)}`),
      "",
      `المجموع: ${formatPrice(total)}`,
      "(السعر لا يشمل اجور التوصيل)",
      "",
      `الاسم: ${form.name || "-"}`,
      `رقم الهاتف: ${form.phone}`,
      `الموقع: ${form.address}`,
      form.notes ? `ملاحظات: ${form.notes}` : "",
    ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
    window.open(`https://wa.me/${SHOP_WA}?text=${encodeURIComponent(msg)}`, "_blank");
    clearCart();
    setCartOpen(false);
  };

  const cats = [{ id: "all", name: "الكل" }, ...data.categories];

  return (
    <Shell
      right={
        <button onClick={() => setCartOpen(true)} className="btn-primary px-4 py-2 text-sm" aria-label="السلة">
          السلة {count > 0 && <span className="ms-2 rounded-full bg-primary-foreground px-2 text-xs text-primary">{count}</span>}
        </button>
      }
    >
      <div className="sticky top-[68px] z-20 border-b border-border bg-background/95">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 sm:px-6 overflow-x-auto px-4 py-3">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300 ${active === c.id ? "border-primary bg-primary text-primary-foreground shadow-lux" : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <span className="eyebrow">OUR MENU</span>
        <h1 className="mt-1 text-3xl font-extrabold text-primary">{cats.find((c) => c.id === active)?.name === "الكل" ? "تشكيلتنا" : cats.find((c) => c.id === active)?.name}</h1>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {items.map((it) => {
          const q = cart[it.id] ?? 0;
          return (
            <article key={it.id} className="card group flex flex-col overflow-hidden p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lux-lg">
              <button onClick={() => setZoom(it)} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                <img src={resolveImage(it.image)} alt={it.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </button>
              <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-primary">{it.title}</h3>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">{formatPrice(it.price)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.description}</p>
                <div className="mt-auto pt-4">
                  {q === 0 ? (
                    <button onClick={() => setQty(it.id, 1)} className="btn-primary w-full py-2.5">+ إضافة للطلب</button>
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl bg-secondary px-3 py-1.5">
                      <span className="text-sm text-muted-foreground">في الطلب</span>
                      <Stepper q={q} onChange={(n) => setQty(it.id, n)} />
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {items.length === 0 && <p className="col-span-full py-16 text-center text-muted-foreground">لا توجد أصناف في هذا القسم.</p>}
      </div>

      <Modal open={!!zoom} onClose={() => setZoom(null)} title={zoom?.title}>
        {zoom && (
          <div>
            <img src={resolveImage(zoom.image)} alt={zoom.title} className="aspect-square w-full rounded-xl object-cover" />
            <p className="mt-4 text-muted-foreground">{zoom.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-semibold">{formatPrice(zoom.price)}</span>
              <button className="btn-primary" onClick={() => { setQty(zoom.id, (cart[zoom.id] ?? 0) + 1); setZoom(null); }}>إضافة للسلة</button>
            </div>
          </div>
        )}
      </Modal>

      <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title="سلة الطلبات">
        {lines.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">السلة فارغة.</p>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <div className="divide-y divide-border">
              {lines.map((l) => (
                <div key={l.item.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{l.item.title}</div>
                    <div className="text-sm text-muted-foreground">{formatPrice(l.item.price * l.qty)}</div>
                  </div>
                  <Stepper q={l.qty} onChange={(n) => setQty(l.item.id, n)} />
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold text-primary">
              <span>المجموع</span><span>{formatPrice(total)}</span>
            </div>
            <input className="field" required placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field" required type="tel" placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="field" required placeholder="الموقع" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <textarea className="field" rows={2} placeholder="ملاحظات (اختياري)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">ملاحظة: السعر لا يشمل اجور التوصيل</p>
            <button type="submit" className="btn-primary w-full">إرسال الطلب</button>
          </form>
        )}
      </Drawer>
    </Shell>
  );
}

function Stepper({ q, onChange }: { q: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center rounded-full border border-border bg-card">
      <button type="button" onClick={() => onChange(q + 1)} className="h-8 w-8 text-primary">+</button>
      <span className="w-6 text-center text-sm">{q}</span>
      <button type="button" onClick={() => onChange(q - 1)} className="h-8 w-8 text-primary">−</button>
    </div>
  );
}
