"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { getCategories, getColors, getMaterials, getProducts, requireSessionToken } from "@/services/api";
import type { CategorySummary, ColorSummary, MaterialSummary, ProductSummary } from "@/types/models";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export default function SkuDashboardPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [materials, setMaterials] = useState<MaterialSummary[]>([]);
  const [colors, setColors] = useState<ColorSummary[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [message, setMessage] = useState("Loading SKU dashboard...");

  useEffectOnce(() => {
    async function load() {
      try {
        const token = requireSessionToken();
        const [nextProducts, nextCategories, nextMaterials, nextColors] = await Promise.all([
          getProducts(token),
          getCategories(token),
          getMaterials(token),
          getColors(token)
        ]);
        setProducts(nextProducts);
        setCategories(nextCategories);
        setMaterials(nextMaterials);
        setColors(nextColors);
        if (nextProducts.length > 0) {
          const latest = [...nextProducts]
            .filter((item) => item.createdAt)
            .sort((left, right) => new Date(right.createdAt ?? "").getTime() - new Date(left.createdAt ?? "").getTime())[0];
          if (latest?.createdAt) {
            const latestDate = new Date(latest.createdAt);
            setDateFrom((current) => current || toDateInputValue(addMonths(latestDate, -1)));
            setDateTo((current) => current || toDateInputValue(latestDate));
          }
        }
        setMessage("SKU dashboard loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load SKU dashboard.");
      }
    }

    void load();
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const createdAt = product.createdAt?.slice(0, 10) ?? "";
      if (dateFrom && createdAt && createdAt < dateFrom) {
        return false;
      }
      if (dateTo && createdAt && createdAt > dateTo) {
        return false;
      }
      return true;
    });
  }, [dateFrom, dateTo, products]);

  const activeProducts = useMemo(() => filteredProducts.filter((item) => item.active).length, [filteredProducts]);
  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of filteredProducts) {
      const key = product.categoryName || "Uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [filteredProducts]);
  const topMaterials = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of filteredProducts) {
      const key = product.materialName || "Not specified";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [filteredProducts]);
  const topColors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of filteredProducts) {
      const key = product.colorName || "Not specified";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [filteredProducts]);

  function handleDateFromChange(value: string) {
    setDateFrom(value);
    if (!value) {
      return;
    }
    if (dateTo) {
      const maxTo = toDateInputValue(addMonths(new Date(value), 1));
      if (dateTo > maxTo) {
        setDateTo(maxTo);
      }
      if (dateTo < value) {
        setDateTo(value);
      }
    }
  }

  function handleDateToChange(value: string) {
    if (!dateFrom || !value) {
      setDateTo(value);
      return;
    }
    const maxTo = toDateInputValue(addMonths(new Date(dateFrom), 1));
    setDateTo(value > maxTo ? maxTo : value);
  }

  const maxDateTo = dateFrom ? toDateInputValue(addMonths(new Date(dateFrom), 1)) : undefined;

  return (
    <AppShell active="/sku-dashboard">
      <div className="topbar">
        <div>
          <h1 className="title">SKUs Dashboard</h1>
          <p className="subtitle">Track product master data, category coverage, and material usage.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      <section className="dashboard-range-panel">
        <div className="dashboard-range-grid">
          <label className="field">
            <span>Date From</span>
            <input type="date" value={dateFrom} onChange={(event) => handleDateFromChange(event.target.value)} />
          </label>
          <label className="field">
            <span>Date To</span>
            <input type="date" value={dateTo} min={dateFrom || undefined} max={maxDateTo} onChange={(event) => handleDateToChange(event.target.value)} />
          </label>
        </div>
      </section>
      <div className="grid cols-3">
        <div className="card metric">
          <div className="metric-label">Products</div>
          <div className="metric-value">{filteredProducts.length}</div>
        </div>
        <div className="card metric">
          <div className="metric-label">Active Products</div>
          <div className="metric-value">{activeProducts}</div>
        </div>
        <div className="card metric">
          <div className="metric-label">Master Data</div>
          <div className="metric-value">{categories.length + materials.length + colors.length}</div>
        </div>
      </div>

      <section className="section">
        <h2>Top 5 Category Coverage</h2>
      </section>
      <DataTable
        headers={["Category", "Products"]}
        rows={topCategories.map(([name, count]) => [name, String(count)])}
        pagination={false}
      />

      <section className="section">
        <h2>Top 5 Materials Coverage</h2>
      </section>
      <DataTable
        headers={["Material", "Products"]}
        rows={topMaterials.map(([name, count]) => [name, String(count)])}
        pagination={false}
      />

      <section className="section">
        <h2>Top 5 Colors Coverage</h2>
      </section>
      <DataTable
        headers={["Color", "Products"]}
        rows={topColors.map(([name, count]) => [name, String(count)])}
        pagination={false}
      />
    </AppShell>
  );
}
