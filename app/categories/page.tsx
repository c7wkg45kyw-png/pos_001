"use client";

import { FormEvent, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createCategory, getCategories, getProducts, requireSessionToken } from "@/services/api";
import { defaultPermissions, getPermissions, type PermissionMatrix } from "@/services/permissions";
import type { CategorySummary, ProductSummary } from "@/types/models";
import { formatDate } from "@/utils/format";

function categoryLabel(item: CategorySummary) {
  return item.thaiName && item.englishName ? `${item.thaiName} (${item.englishName})` : item.thaiName || item.englishName;
}

export default function CategoriesPage() {
  const [items, setItems] = useState<CategorySummary[]>([]);
  const [token, setToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>(defaultPermissions());
  const [message, setMessage] = useState("Loading categories...");

  useEffectOnce(() => {
    setPermissions(getPermissions());
    async function load() {
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        const [categoryItems, productItems] = await Promise.all([getCategories(nextToken), getProducts(nextToken)]);
        setItems(categoryItems);
        setProducts(productItems);
        setMessage("Categories loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load categories.");
      }
    }
    void load();
  });

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const thaiName = String(form.get("thaiName") ?? "").trim();
    const englishName = String(form.get("englishName") ?? "").trim();
    const companyId = String(form.get("companyId") ?? "").trim() || "QMS001";
    const isActive = form.get("isActive") === "on";

    if (!thaiName && !englishName) {
      setMessage("Thai name or English name is required.");
      return;
    }
    if (!permissions.products.create) {
      setMessage("Category create permission is blocked.");
      return;
    }

    try {
      const item = await createCategory(token, { thaiName, englishName, companyId, isActive });
      setItems((current) => [item, ...current]);
      setMessage(`${categoryLabel(item)} saved to backend.`);
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save category.");
    }
  }

  return (
    <AppShell
      active="/categories"
      headerActions={<button className="button primary" type="button" onClick={() => setIsModalOpen(true)} disabled={!permissions.products.create}>New Category</button>}
    >
      <div className="topbar">
        <div>
          <h1 className="title">Categories</h1>
          <p className="subtitle">Manage category master data for product selection.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={addCategory}>
            <div className="panel-heading">
              <h2>New Category</h2>
              <button className="button compact" type="button" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            <label className="field">
              <span>ชื่อภาษาไทย</span>
              <input name="thaiName" placeholder="ชื่อภาษาไทย" autoFocus required />
            </label>
            <label className="field">
              <span>English Name</span>
              <input name="englishName" placeholder="English name" required />
            </label>
            <label className="field">
              <span>Company ID</span>
              <input name="companyId" defaultValue="QMS001" maxLength={6} required />
            </label>
            <label className="field checkbox-field">
              <span>Is Active</span>
              <input name="isActive" type="checkbox" defaultChecked />
            </label>
            <div className="toolbar">
              <button className="button" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="button primary" type="submit">Save Category</button>
            </div>
          </form>
        </div>
      ) : null}
      <DataTable
        headers={["Category", "Products Amount", "Create Date (Update Date)", "Create By (Update By)"]}
        rows={items.map((item) => [
          categoryLabel(item),
          String(products.filter((product) => product.categoryId === item.id).length),
          `${formatDate(item.createdAt)} (${formatDate(item.updatedAt)})`,
          `${item.createdBy} (${item.updatedBy})`
        ])}
      />
    </AppShell>
  );
}
