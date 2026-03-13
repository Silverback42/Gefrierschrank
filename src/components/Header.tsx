"use client";

import type { Product } from "@/lib/types";

interface HeaderProps {
  items: Product[];
  onAddClick: () => void;
}

export default function Header({ items, onAddClick }: HeaderProps) {
  const totalProducts = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span>{"\u{2744}\u{FE0F}"}</span>
          Gefrierschrank
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {totalProducts} {totalProducts === 1 ? "Produkt" : "Produkte"},{" "}
          {totalQuantity} {totalQuantity === 1 ? "Stueck" : "Stueck"}
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold text-base hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all"
      >
        <span className="text-xl leading-none">+</span>
        <span className="hidden sm:inline">Neu</span>
      </button>
    </header>
  );
}
