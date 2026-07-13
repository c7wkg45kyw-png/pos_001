"use client";

import { FormEvent, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createColor, getColors, getProducts, requireSessionToken } from "@/services/api";
import { defaultPermissions, getPermissions, type PermissionMatrix } from "@/services/permissions";
import type { ColorSummary, ProductSummary } from "@/types/models";
import { formatDate } from "@/utils/format";

function colorLabel(item: ColorSummary) {
  return item.thaiName && item.englishName ? `${item.thaiName} (${item.englishName})` : item.thaiName || item.englishName;
}

export default function ColorsPage() {
  const [items, setItems] = useState<ColorSummary[]>([]);
  const [token, setToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>(defaultPermissions());
  const [message, setMessage] = useState("Loading colors...");

  useEffectOnce(() => {
    setPermissions(getPermissions());
    async function load() {
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        const [colorItems, productItems] = await Promise.all([getColors(nextToken), getProducts(nextToken)]);
        setItems(colorItems);
        setProducts(productItems);
        setMessage("Colors loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load colors.");
      }
    }
    void load();
  });

  async function addColor(event: FormEvent<HTMLFormElement>) {
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
      setMessage("Color create permission is blocked.");
      return;
    }

    try {
      const item = await createColor(token, { thaiName, englishName, companyId, isActive });
      setItems((current) => [item, ...current]);
      setMessage(`${colorLabel(item)} saved to backend.`);
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save color.");
    }
  }

  return (
    <AppShell
      active="/colors"
      headerActions={<button className="button primary" type="button" onClick={() => setIsModalOpen(true)} disabled={!permissions.products.create}>New Color</button>}
    >
      <div className="topbar">
        <div>
          <h1 className="title">Colors</h1>
          <p className="subtitle">Manage color master data for product selection.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={addColor}>
            <div className="panel-heading">
              <h2>New Color</h2>
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
              <button className="button primary" type="submit">Save Color</button>
            </div>
          </form>
        </div>
      ) : null}
      <DataTable
        headers={["Color", "Products Amount", "Create Date (Update Date)", "Create By (Update By)"]}
        rows={items.map((item) => [
          colorLabel(item),
          String(products.filter((product) => product.colorId === item.id).length),
          `${formatDate(item.createdAt)} (${formatDate(item.updatedAt)})`,
          `${item.createdBy} (${item.updatedBy})`
        ])}
      />
    </AppShell>
  );
}
