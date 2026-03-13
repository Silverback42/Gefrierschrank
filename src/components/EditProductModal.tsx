"use client";

import { useState, useEffect } from "react";
import { FREEZER_EMOJIS } from "@/lib/emojis";
import type { Product, ActivityLogEntry } from "@/lib/types";
import { getActivityLog } from "@/lib/actions";

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (id: number, data: { name?: string; quantity?: number; icon?: string | null }) => void;
  onDelete: (id: number) => void;
}

export default function EditProductModal({
  product,
  onClose,
  onSave,
  onDelete,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setQuantity(product.quantity);
      setSelectedEmoji(product.icon);
      setShowDeleteConfirm(false);
      getActivityLog(product.id, 5).then(setActivity);
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(product.id, {
      name: name.trim(),
      quantity,
      icon: selectedEmoji,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr + "Z");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return "gerade eben";
    if (diffMin < 60) return `vor ${diffMin} Min.`;
    if (diffH < 24) return `vor ${diffH} Std.`;
    if (diffD < 7) return `vor ${diffD} T.`;
    return `vor ${Math.floor(diffD / 7)} W.`;
  };

  const actionLabels: Record<string, string> = {
    add: "aufgefuellt",
    remove: "entnommen",
    set: "gesetzt",
    create: "erstellt",
    delete: "geloescht",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md mx-4 mb-0 md:mb-0 rounded-t-2xl md:rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 animate-slide-up max-h-[85dvh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">
          {product.icon || "\u{2744}\u{FE0F}"} {product.name} bearbeiten
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Product name */}
          <input
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

          {/* Activity log */}
          {activity.length > 0 && (
            <div>
              <span className="text-sm text-[var(--color-text-muted)] mb-2 block">
                Letzte Aktivitaet:
              </span>
              <div className="flex flex-col gap-1">
                {activity.map((entry) => (
                  <div
                    key={entry.id}
                    className="text-xs text-[var(--color-text-muted)] flex justify-between"
                  >
                    <span>
                      {Math.abs(entry.quantity_change)} Stk.{" "}
                      {actionLabels[entry.action] || entry.action}
                    </span>
                    <span>{formatTimeAgo(entry.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-4 rounded-xl text-[var(--color-danger)] bg-[var(--color-surface-hover)] font-semibold active:scale-95 transition-all"
              >
                Loeschen
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-[var(--color-danger)] text-white font-semibold active:scale-95 transition-all"
              >
                Wirklich loeschen?
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] font-semibold active:scale-95 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="py-3 px-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
