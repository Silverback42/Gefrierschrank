import type { Product } from "./types";

/**
 * Sortiert Produkte fuer die Anzeige: volle Produkte nach vorne,
 * leere (Menge 0) automatisch ans Ende. Innerhalb einer Gruppe bleibt
 * die bisherige Reihenfolge (sort_order, dann Name) erhalten.
 */
export function sortByAvailability(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    const aEmpty = a.quantity === 0 ? 1 : 0;
    const bEmpty = b.quantity === 0 ? 1 : 0;
    if (aEmpty !== bEmpty) return aEmpty - bEmpty;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name, "de");
  });
}
