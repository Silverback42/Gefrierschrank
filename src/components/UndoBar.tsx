"use client";

import { useEffect, useState } from "react";

export interface UndoAction {
  productId: number;
  productName: string;
  type: "increment" | "decrement";
  previousQuantity: number;
  newQuantity: number;
}

interface UndoBarProps {
  action: UndoAction | null;
  onUndo: (action: UndoAction) => void;
  onDismiss: () => void;
}

export default function UndoBar({ action, onUndo, onDismiss }: UndoBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (action) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [action, onDismiss]);

  if (!action) return null;

  const message =
    action.type === "decrement"
      ? `${action.productName} entnommen (${action.previousQuantity} \u{2192} ${action.newQuantity})`
      : `${action.productName} aufgefuellt (${action.previousQuantity} \u{2192} ${action.newQuantity})`;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
        <span className="text-sm text-[var(--color-text-muted)] truncate">
          {message}
        </span>
        <button
          onClick={() => {
            onUndo(action);
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all"
        >
          Rueckgaengig
        </button>
      </div>
    </div>
  );
}
