import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import fallbackLogo from "@/assets/logo.png";
import { openDeepLink, useStore } from "@/lib/store";

/** Uses /logo.png from the public folder (or one uploaded in admin), falling back to the bundled mark. */
export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  const { logoUrl } = useStore();
  const [src, setSrc] = useState(fallbackLogo);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSrc(logoUrl);
    img.onerror = () => setSrc(fallbackLogo);
    img.src = logoUrl;
  }, [logoUrl]);
  return <img src={src} alt="شعار حلويات ابو شوارب" width={size} height={size} className={`object-contain ${className ?? ""}`} />;
}

export function Shell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-11 w-11" size={44} />
            <div className="leading-tight">
              <div className="text-lg font-bold text-primary">حلويات ابو شوارب</div>
              <div className="text-[11px] tracking-widest text-gold">ABO SHUWARB SWEETS</div>
            </div>
          </Link>
          {right}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-10 border-t border-border/70 py-8 text-center">
        <div className="divider-ornament mb-4" />
        <button
          onClick={() => openDeepLink("instagram://user?username=zoq_iq", "https://instagram.com/zoq_iq")}
          className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-primary"
          dir="ltr"
        >
          Designed By @zoq_iq
        </button>
      </footer>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string | undefined; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 backdrop-blur-[2px] animate-in fade-in duration-300 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-lux-lg animate-in slide-in-from-bottom-8 duration-300 sm:rounded-3xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <CloseBtn onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

export function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="إغلاق" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-accent">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 1l12 12M13 1L1 13" /></svg>
    </button>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-overlay animate-in fade-in duration-300" onClick={onClose}>
      <aside
        className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-card shadow-lux-lg animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}
