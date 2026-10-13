import type { StoreItem } from "@/lib/store";
import { CoinGlyph } from "./coin-icon";

export function Catalog({ items, mode }: { items: readonly StoreItem[]; mode: string }) {
  return (
    <div>
      {items.length === 0 ? (
        <div className="relative overflow-hidden border border-dashed border-line-strong p-8 sm:p-12">
          <div aria-hidden="true" className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
          <p className="jn-eyebrow text-accent-ink">Ranks</p>
          <p className="font-display relative mt-3 text-4xl font-black text-fg sm:text-5xl">
            {mode} ranks are on the way
          </p>
          <p className="relative mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
            The first ranks will appear here, bought with coins. Announcements
            land on Discord first.
          </p>
        </div>
      ) : (
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="group relative flex flex-col bg-surface p-6 transition-colors duration-300 hover:bg-surface-raised">
              <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-0 bg-accent transition-[width] duration-500 ease-[var(--ease)] group-hover:w-full" />
              <p className="font-display text-3xl font-black text-fg">{item.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.description}</p>
              <ul className="mt-5 space-y-2 border-t border-line pt-4">
                {item.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-fg-muted">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <span className="inline-flex items-center gap-2 font-mono text-lg font-semibold text-fg">
                  <CoinGlyph className="h-5 w-5 text-accent-ink" />
                  {item.price.toLocaleString("en-US")}
                </span>
                <button type="button" disabled={!item.available} className="jn-btn jn-btn-primary !min-h-11 disabled:cursor-not-allowed disabled:opacity-40">
                  {item.available ? "Buy" : "Coming soon"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-px flex items-center justify-between gap-4 border border-t-0 border-line px-6 py-5">
        <p className="font-display text-2xl font-extrabold tracking-[0.03em] text-fg-muted">More coming soon</p>
        <span className="jn-eyebrow text-fg-subtle">Updates on Discord</span>
      </div>
    </div>
  );
}
