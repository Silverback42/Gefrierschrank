"use client";

import { useState } from "react";
import { FREEZER_EMOJIS } from "@/lib/emojis";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, quantity: number, icon: string | null) => void;
}

export default function AddProductModal({
  open,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), quantity, selectedEmoji);
    setName("");
    setQuantity(1);
    setSelectedEmoji(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md mx-4 mb-0 md:mb-0 rounded-t-2xl md:rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 animate-slide-up">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">
          Neues Produkt
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Product name */}
          <input
            autoFocus
            type="text"
            placeholder="Produktname..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-lg placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
          />

          {/* Quantity stepper */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">Anzahl:</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(0, quantity - 1))}
              className="w-10 h-10 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xl font-bold active:scale-95 transition-transform"
            >
              &minus;
            </button>
            <span className="text-2xl font-bold text-[var(--color-text)] tabular-nums w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xl font-bold active:scale-95 transition-transform"
            >
              +
            </button>
          </div>

          {/* Emoji picker */}
          <div>
            <span className="text-sm text-[var(--color-text-muted)] mb-2 block">
              Icon:
            </span>
            <div className="grid grid-cols-8 gap-2">
              {FREEZER_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setSelectedEmoji(selectedEmoji === emoji ? null : emoji)
                  }
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all active:scale-90 ${
                    selectedEmoji === emoji
                      ? "bg-[var(--color-primary)] scale-110"
                      : "bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] font-semibold active:scale-95 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hinzufuegen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
