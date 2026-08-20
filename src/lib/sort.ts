import type { Product } from "./types";

/**
 * Sortiert Produkte fuer die Anzeige: volle Produkte zuerst, leere
 * (Menge 0) automatisch ans Ende. Innerhalb der beiden Gruppen bleibt
 * die bisherige Reihenfolge (sort_order, dann Name) erhalten.
 */
export function sortByFillState(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    const aEmpty = a.quantity === 0;
    const bEmpty = b.quantity === 0;
    if (aEmpty !== bEmpty) {
      return aEmpty ? 1 : -1;
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name, "de");
  });
}
