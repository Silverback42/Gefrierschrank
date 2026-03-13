export interface Product {
  id: number;
  name: string;
  quantity: number;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: number;
  product_id: number;
  action: "add" | "remove" | "set" | "create" | "delete";
  quantity_change: number;
  quantity_after: number;
  created_at: string;
}

export interface ProductWithHistory extends Product {
  recent_activity: ActivityLogEntry[];
}
