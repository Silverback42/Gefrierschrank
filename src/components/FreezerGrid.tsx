"use client";

import {
  useOptimistic,
  useState,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import type { Product } from "@/lib/types";
import { sortByFillState } from "@/lib/sort";
import ProductTile from "./ProductTile";
import Header from "./Header";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import UndoBar, { type UndoAction } from "./UndoBar";
import {
  incrementItem,
  decrementItem,
  createItem,
  updateItem,
  deleteItem,
  undoAction,
} from "@/lib/actions";

type OptimisticAction =
  | { type: "increment"; id: number }
  | { type: "decrement"; id: number }
  | { type: "add"; product: Product }
  | { type: "update"; id: number; data: Partial<Product> }
  | { type: "delete"; id: number }
  | { type: "undo"; id: number; quantity: number };

interface FreezerGridProps {
  initialItems: Product[];
}

export default function FreezerGrid({ initialItems }: FreezerGridProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [undoInfo, setUndoInfo] = useState<UndoAction | null>(null);

  const [optimisticItems, addOptimistic] = useOptimistic<
    Product[],
    OptimisticAction
  >(initialItems, (state, action) => {
    switch (action.type) {
      case "increment":
        return state.map((item) =>
          item.id === action.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      case "decrement":
        return state.map((item) =>
          item.id === action.id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        );
      case "add":
        return [...state, action.product];
      case "update":
        return state.map((item) =>
          item.id === action.id ? { ...item, ...action.data } : item
        );
      case "delete":
        return state.filter((item) => item.id !== action.id);
      case "undo":
        return state.map((item) =>
          item.id === action.id
            ? { ...item, quantity: action.quantity }
            : item
        );
      default:
        return state;
    }
  });

  // Leere Produkte wandern sofort ans Ende, aufgefuellte nach vorne
  const sortedItems = useMemo(
    () => sortByFillState(optimisticItems),
    [optimisticItems]
  );

  const handleIncrement = useCallback(
    (id: number) => {
      const product = optimisticItems.find((p) => p.id === id);
      if (!product) return;

      if (navigator.vibrate) navigator.vibrate(30);

      setUndoInfo({
        productId: id,
        productName: product.name,
        type: "increment",
        previousQuantity: product.quantity,
        newQuantity: product.quantity + 1,
      });

      startTransition(async () => {
        addOptimistic({ type: "increment", id });
        await incrementItem(id);
      });
    },
    [optimisticItems, addOptimistic]
  );

  const handleDecrement = useCallback(
    (id: number) => {
      const product = optimisticItems.find((p) => p.id === id);
      if (!product || product.quantity === 0) return;

      if (navigator.vibrate) navigator.vibrate(30);

      setUndoInfo({
        productId: id,
        productName: product.name,
        type: "decrement",
        previousQuantity: product.quantity,
        newQuantity: product.quantity - 1,
      });

      startTransition(async () => {
        addOptimistic({ type: "decrement", id });
        await decrementItem(id);
      });
    },
    [optimisticItems, addOptimistic]
  );

  const handleAdd = useCallback(
    (name: string, quantity: number, icon: string | null) => {
      const tempProduct: Product = {
        id: Date.now(),
        name,
        quantity,
        icon,
        sort_order: optimisticItems.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      startTransition(async () => {
        addOptimistic({ type: "add", product: tempProduct });
        await createItem(name, quantity, icon);
      });
    },
    [optimisticItems.length, addOptimistic]
  );

  const handleUpdate = useCallback(
    (
      id: number,
      data: { name?: string; quantity?: number; icon?: string | null }
    ) => {
      startTransition(async () => {
        addOptimistic({ type: "update", id, data });
        await updateItem(id, data);
      });
    },
    [addOptimistic]
  );

  const handleDelete = useCallback(
    (id: number) => {
      startTransition(async () => {
        addOptimistic({ type: "delete", id });
        await deleteItem(id);
      });
    },
    [addOptimistic]
  );

  const handleUndo = useCallback(
    (action: UndoAction) => {
      startTransition(async () => {
        addOptimistic({
          type: "undo",
          id: action.productId,
          quantity: action.previousQuantity,
        });
        await undoAction(action.productId, action.previousQuantity);
      });
    },
    [addOptimistic]
  );

  const handleDismissUndo = useCallback(() => {
    setUndoInfo(null);
  }, []);

  return (
    <>
      <Header items={optimisticItems} onAddClick={() => setShowAddModal(true)} />

      <main className="p-4 md:p-6 pb-24">
        {optimisticItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50dvh] gap-4">
            <span className="text-6xl">{"\u{2744}\u{FE0F}"}</span>
            <p className="text-lg text-[var(--color-text-muted)] text-center">
              Dein Gefrierschrank ist leer.
              <br />
              Fuege dein erstes Produkt hinzu!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold active:scale-95 transition-all"
            >
              + Erstes Produkt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {sortedItems.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onEdit={setEditProduct}
              />
            ))}
            {/* Add new tile */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] p-4 min-h-[180px] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-95 transition-all"
            >
              <span className="text-3xl mb-2">+</span>
              <span className="text-sm">Neu</span>
            </button>
          </div>
        )}
      </main>

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />

      <EditProductModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleUpdate}
        onDelete={handleDelete}
      />

      <UndoBar
        action={undoInfo}
        onUndo={handleUndo}
        onDismiss={handleDismissUndo}
      />
    </>
  );
}
