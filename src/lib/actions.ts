"use server";

import { revalidatePath } from "next/cache";
import db from "./db";
import type { Product, ActivityLogEntry } from "./types";

export async function getItems(): Promise<Product[]> {
  const rows = db
    .prepare("SELECT * FROM products ORDER BY sort_order ASC, name ASC")
    .all() as Product[];
  return rows;
}

export async function createItem(
  name: string,
  quantity: number = 1,
  icon: string | null = null
): Promise<Product> {
  const maxOrder = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM products")
    .get() as { next_order: number };

  const insert = db.prepare(
    "INSERT INTO products (name, quantity, icon, sort_order) VALUES (?, ?, ?, ?)"
  );
  const logInsert = db.prepare(
    "INSERT INTO activity_log (product_id, action, quantity_change, quantity_after) VALUES (?, ?, ?, ?)"
  );

  const result = db.transaction(() => {
    const info = insert.run(name.trim(), quantity, icon, maxOrder.next_order);
    const productId = info.lastInsertRowid as number;
    logInsert.run(productId, "create", quantity, quantity);
    return db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId) as Product;
  })();

  revalidatePath("/");
  return result;
}

export async function incrementItem(id: number): Promise<Product> {
  const update = db.prepare(
    "UPDATE products SET quantity = quantity + 1, updated_at = datetime('now') WHERE id = ?"
  );
  const logInsert = db.prepare(
    "INSERT INTO activity_log (product_id, action, quantity_change, quantity_after) VALUES (?, ?, ?, ?)"
  );

  const result = db.transaction(() => {
    update.run(id);
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as Product;
    logInsert.run(id, "add", 1, product.quantity);
    return product;
  })();

  revalidatePath("/");
  return result;
}

export async function decrementItem(id: number): Promise<Product> {
  const update = db.prepare(
    "UPDATE products SET quantity = MAX(0, quantity - 1), updated_at = datetime('now') WHERE id = ?"
  );
  const logInsert = db.prepare(
    "INSERT INTO activity_log (product_id, action, quantity_change, quantity_after) VALUES (?, ?, ?, ?)"
  );

  const result = db.transaction(() => {
    update.run(id);
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as Product;
    logInsert.run(id, "remove", -1, product.quantity);
    return product;
  })();

  revalidatePath("/");
  return result;
}

export async function updateItem(
  id: number,
  data: { name?: string; quantity?: number; icon?: string | null }
): Promise<Product> {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as Product;

  const newName = data.name?.trim() ?? product.name;
  const newQuantity = data.quantity ?? product.quantity;
  const newIcon = data.icon !== undefined ? data.icon : product.icon;

  const update = db.prepare(
    "UPDATE products SET name = ?, quantity = ?, icon = ?, updated_at = datetime('now') WHERE id = ?"
  );
  const logInsert = db.prepare(
    "INSERT INTO activity_log (product_id, action, quantity_change, quantity_after) VALUES (?, ?, ?, ?)"
  );

  const result = db.transaction(() => {
    update.run(newName, newQuantity, newIcon, id);
    if (newQuantity !== product.quantity) {
      logInsert.run(id, "set", newQuantity - product.quantity, newQuantity);
    }
    return db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as Product;
  })();

  revalidatePath("/");
  return result;
}

export async function deleteItem(id: number): Promise<void> {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as Product | undefined;

  if (product) {
    const logInsert = db.prepare(
      "INSERT INTO activity_log (product_id, action, quantity_change, quantity_after) VALUES (?, ?, ?, ?)"
    );
    const del = db.prepare("DELETE FROM products WHERE id = ?");

    db.transaction(() => {
      logInsert.run(id, "delete", -product.quantity, 0);
      del.run(id);
    })();
  }

  revalidatePath("/");
}

export async function getActivityLog(
  productId: number,
  limit: number = 5
): Promise<ActivityLogEntry[]> {
  return db
    .prepare(
      "SELECT * FROM activity_log WHERE product_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(productId, limit) as ActivityLogEntry[];
}

export async function undoAction(
  productId: number,
  previousQuantity: number
): Promise<Product> {
  const update = db.prepare(
    "UPDATE products SET quantity = ?, updated_at = datetime('now') WHERE id = ?"
  );

  const result = db.transaction(() => {
    update.run(previousQuantity, productId);
    return db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(productId) as Product;
  })();

  revalidatePath("/");
  return result;
}
