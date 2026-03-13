"use client";

import type { Product } from "@/lib/types";

interface ProductTileProps {
  product: Product;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onEdit: (product: Product) => void;
}

export default function ProductTile({
  product,
  onIncrement,
  onDecrement,
  onEdit,
}: ProductTileProps) {
  const isEmpty = product.quantity === 0;

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border p-4 transition-all ${
        isEmpty
          ? "border-[var(--color-border)] bg-[var(--color-surface)] opacity-50"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      {/* Emoji + Name (tappable for edit) */}
      <button
        onClick={() => onEdit(product)}
        className="flex flex-col items-center gap-1 mb-2 w-full active:scale-95 transition-transform"
      >
        <span className="text-4xl md:text-5xl leading-none">
          {product.icon || "\u{2744}\u{FE0F}"}
        </span>
        <span className="text-sm md:text-base text-[var(--color-text-muted)] truncate max-w-full px-1">
          {product.name}
        </span>
      </button>

      {/* Quantity */}
      <span
        className={`text-4xl md:text-5xl font-bold tabular-nums mb-3 ${
          isEmpty ? "text-[var(--color-empty)]" : "text-[var(--color-text)]"
        }`}
      >
        {product.quantity}
      </span>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => onDecrement(product.id)}
          disabled={isEmpty}
          className={`flex-1 h-14 rounded-xl text-2xl font-bold transition-all active:scale-95 ${
            isEmpty
              ? "bg-[var(--color-surface-hover)] text-[var(--color-empty)] cursor-not-allowed"
              : "bg-[var(--color-surface-hover)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white active:bg-[var(--color-danger)]"
          }`}
        >
          &minus;
        </button>
        <button
          onClick={() => onIncrement(product.id)}
          className="flex-1 h-14 rounded-xl text-2xl font-bold bg-[var(--color-surface-hover)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white active:bg-[var(--color-success)] active:scale-95 transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}
