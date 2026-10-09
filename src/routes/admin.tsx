import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { downloadJson, formatPrice, resolveImage, uid, useStore, type Item, type MenuData } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | حلويات ابو شوارب" },
      { name: "description", content: "إدارة أقسام وأصناف المنيو." },
      { property: "og:title", content: "لوحة التحكم | حلويات ابو شوارب" },
      { property: "og:description", content: "إدارة المنيو محلياً." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const PASS = "1123";

function move<T>(arr: T[], from: number, to: number) {
  const a = [...arr];
  const x = a.splice(from, 1)[0] as T;
  a.splice(to, 0, x);
  return a;
}

function Admin() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  if (!ok)
    return (
      <Shell>
        <form onSubmit={(e) => { e.preventDefault(); if (pw === PASS) setOk(true); }} className="card mx-auto mt-16 max-w-sm space-y-4 p-6">
          <h1 className="text-lg font-semibold text-primary">دخول لوحة التحكم</h1>
          <input className="field" type="password" placeholder="كلمة المرور" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button className="btn-primary w-full">دخول</button>
        </form>
      </Shell>
    );
  return <Dashboard />;
}

function Dashboard() {
  const { data, setData, setVideoUrl, setLogoUrl } = useStore();
  const logoRef = useRef<HTMLInputElement>(null);
  const [newCat, setNewCat] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const drag = useRef<{ type: "cat" | "item"; idx: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const update = (d: Partial<MenuData>) => setData({ ...data, ...d });

  const importFile = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      if (Array.isArray(j.categories) && Array.isArray(j.items)) setData(j);
      else alert("ملف غير صالح");
    } catch { alert("ملف غير صالح"); }
  };

  const saveItem = () => {
    if (!editing || !editing.title) return;
    const exists = data.items.some((i) => i.id === editing.id);
    update({ items: exists ? data.items.map((i) => (i.id === editing.id ? editing : i)) : [...data.items, editing] });
    setEditing(null);
  };

  const onDrop = (type: "cat" | "item", idx: number) => {
    const d = drag.current;
    if (!d || d.type !== type) return;
    if (type === "cat") update({ categories: move(data.categories, d.idx, idx) });
    else update({ items: move(data.items, d.idx, idx) });
    drag.current = null;
  };

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="card flex flex-wrap items-center gap-3 p-4">
          <h1 className="me-auto text-xl font-semibold text-primary">لوحة التحكم</h1>
          <button className="btn-primary text-sm" onClick={() => downloadJson(data)}>تصدير / حفظ menu-data.json</button>
          <button className="btn-outline text-sm" onClick={() => fileRef.current?.click()}>استيراد ملف</button>
          <button className="btn-outline text-sm" onClick={() => videoRef.current?.click()}>تغيير فيديو التحميل</button>
          <input ref={fileRef} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
          <button className="btn-outline text-sm" onClick={() => logoRef.current?.click()}>تغيير الشعار</button>
          <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoUrl(URL.createObjectURL(f)); }} />
          <input ref={videoRef} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setVideoUrl(URL.createObjectURL(f)); alert("تم تحديث فيديو التحميل"); } }} />
        </div>

        <section className="card p-4">
          <h2 className="mb-3 font-semibold text-primary">الأقسام</h2>
          <ul className="space-y-2">
            {data.categories.map((c, idx) => (
              <li key={c.id} draggable onDragStart={() => (drag.current = { type: "cat", idx })} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop("cat", idx)}
                className="flex cursor-grab items-center gap-2 rounded-lg border border-border bg-background p-2">
                <span className="px-1 text-muted-foreground">⋮⋮</span>
                <input className="field py-1.5" value={c.name} onChange={(e) => update({ categories: data.categories.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)) })} />
                <button className="text-sm text-destructive" onClick={() => confirm("حذف القسم وأصنافه؟") && update({ categories: data.categories.filter((x) => x.id !== c.id), items: data.items.filter((i) => i.categoryId !== c.id) })}>حذف</button>
              </li>
            ))}
          </ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!newCat.trim()) return; update({ categories: [...data.categories, { id: uid(), name: newCat.trim() }] }); setNewCat(""); }}>
            <input className="field" placeholder="اسم قسم جديد" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button className="btn-primary shrink-0 py-2 text-sm">إضافة</button>
          </form>
        </section>

        <section className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-primary">الأصناف</h2>
            <button className="btn-primary py-2 text-sm" disabled={!data.categories.length}
              onClick={() => setEditing({ id: uid(), categoryId: data.categories[0]?.id ?? "", title: "", description: "", price: 0, image: "" })}>صنف جديد</button>
          </div>
          <ul className="space-y-2">
            {data.items.map((it, idx) => (
              <li key={it.id} draggable onDragStart={() => (drag.current = { type: "item", idx })} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop("item", idx)}
                className="flex cursor-grab items-center gap-3 rounded-lg border border-border bg-background p-2">
                <span className="px-1 text-muted-foreground">⋮⋮</span>
                {it.image ? <img src={resolveImage(it.image)} alt="" className="h-12 w-12 rounded-md object-cover" /> : <div className="h-12 w-12 rounded-md bg-muted" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{data.categories.find((c) => c.id === it.categoryId)?.name} · {formatPrice(it.price)}</div>
                </div>
                <button className="text-sm text-primary" onClick={() => setEditing(it)}>تعديل</button>
                <button className="text-sm text-destructive" onClick={() => confirm("حذف الصنف؟") && update({ items: data.items.filter((x) => x.id !== it.id) })}>حذف</button>
              </li>
            ))}
          </ul>
        </section>

        {editing && (
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold text-primary">بيانات الصنف</h2>
            <select className="field" value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}>
              {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="field" placeholder="الاسم" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <input className="field" type="number" placeholder="السعر" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
            <textarea className="field" rows={2} placeholder="الوصف" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <input className="field" dir="ltr" placeholder="رابط أو مسار الصورة مثل /images/item.jpg" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={saveItem}>حفظ</button>
              <button className="btn-outline" onClick={() => setEditing(null)}>إلغاء</button>
            </div>
          </section>
        )}
        <p className="text-center text-xs text-muted-foreground">التعديلات مؤقتة حتى تقوم بتصدير الملف واستبدال menu-data.json به.</p>
      </div>
    </Shell>
  );
}
