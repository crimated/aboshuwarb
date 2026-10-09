import { createContext, useContext, useState, type ReactNode } from "react";
import initial from "@/data/menu-data.json";
import baklava from "@/assets/baklava.jpg";
import kunafa from "@/assets/kunafa.jpg";
import maamoul from "@/assets/maamoul.jpg";

export type Category = { id: string; name: string };
export type Item = { id: string; categoryId: string; title: string; description: string; price: number; image: string };
export type MenuData = { categories: Category[]; items: Item[] };
export type CartLine = { item: Item; qty: number };

const builtIn: Record<string, string> = { baklava, kunafa, maamoul };
export const resolveImage = (src: string) => builtIn[src] ?? src;
export const formatPrice = (n: number) => `${n.toLocaleString("en-US")} د.ع`;
export const uid = () => Math.random().toString(36).slice(2, 10);

export const SHOP_WA = "9647711221123";

type Store = {
  data: MenuData;
  setData: (d: MenuData) => void;
  cart: Record<string, number>;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  logoUrl: string;
  setLogoUrl: (u: string) => void;
  videoUrl: string;
  setVideoUrl: (u: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MenuData>(initial as MenuData);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [videoUrl, setVideoUrl] = useState("/loading.mp4");
  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const n = { ...c };
      if (qty <= 0) delete n[id];
      else n[id] = qty;
      return n;
    });
  return (
    <Ctx.Provider value={{ data, setData, cart, setQty, clearCart: () => setCart({}), videoUrl, setVideoUrl, logoUrl, setLogoUrl }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

export function downloadJson(data: MenuData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "menu-data.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function openDeepLink(app: string, web: string) {
  const start = Date.now();
  window.location.href = app;
  setTimeout(() => {
    if (Date.now() - start < 2000 && !document.hidden) window.open(web, "_blank");
  }, 1200);
}
