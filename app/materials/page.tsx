"use client";

import { FormEvent, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createMaterial, getMaterials, getProducts, requireSessionToken } from "@/services/api";
import { defaultPermissions, getPermissions, type PermissionMatrix } from "@/services/permissions";
import type { MaterialSummary, ProductSummary } from "@/types/models";
import { formatDate } from "@/utils/format";

function materialLabel(item: MaterialSummary) {
  return item.thaiName && item.englishName ? `${item.thaiName} (${item.englishName})` : item.thaiName || item.englishName;
}

export default function MaterialsPage() {
  const [items, setItems] = useState<MaterialSummary[]>([]);
  const [token, setToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>(defaultPermissions());
  const [message, setMessage] = useState("Loading materials...");

  useEffectOnce(() => {
    setPermissions(getPermissions());
    async function load() {
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        const [materialItems, productItems] = await Promise.all([getMaterials(nextToken), getProducts(nextToken)]);
        setItems(materialItems);
        setProducts(productItems);
        setMessage("Materials loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load materials.");
      }
    }
    void load();
  });

  async function addMaterial(event: FormEvent<HTMLFormElement>) {
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
      setMessage("Material create permission is blocked.");
      return;
    }

    try {
      const item = await createMaterial(token, { thaiName, englishName, companyId, isActive });
      setItems((current) => [item, ...current]);
      setMessage(`${materialLabel(item)} saved to backend.`);
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save material.");
    }
  }

  return (
    <AppShell
      active="/materials"
      headerActions={<button className="button primary" type="button" onClick={() => setIsModalOpen(true)} disabled={!permissions.products.create}>New Material</button>}
    >
      <div className="topbar">
        <div>
          <h1 className="title">Materials</h1>
          <p className="subtitle">Manage material master data for product selection.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={addMaterial}>
            <div className="panel-heading">
              <h2>New Material</h2>
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
              <button className="button primary" type="submit">Save Material</button>
            </div>
          </form>
        </div>
      ) : null}
      <DataTable
        headers={["Material", "Products Amount", "Create Date (Update Date)", "Create By (Update By)"]}
        rows={items.map((item) => [
          materialLabel(item),
          String(products.filter((product) => product.materialId === item.id).length),
          `${formatDate(item.createdAt)} (${formatDate(item.updatedAt)})`,
          `${item.createdBy} (${item.updatedBy})`
        ])}
      />
    </AppShell>
  );
}
