"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createPriceRule, getPriceRules, getPriceTiers, getProducts, getSessionProfile, requireSessionToken } from "@/services/api";
import type { PriceRuleSummary, PriceTierSummary, ProductSummary } from "@/types/models";
import { formatDate } from "@/utils/format";

const DEFAULT_TAX_CODE_ID = "e6febaa4-5033-4f2b-a631-c1cba72681ea";

export default function ProductPriceTiersPage() {
  const [priceRules, setPriceRules] = useState<PriceRuleSummary[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTierSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [token, setToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading product price tiers...");
  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>([
    "productName",
    "productCode",
    "priceTier",
    "standardPrice",
    "discountLimitPercent",
    "createdDate",
    "owner"
  ]);

  useEffectOnce(() => {
    async function load() {
      try {
        const nextToken = requireSessionToken();
        const [priceRuleItems, priceTierItems, productItems] = await Promise.all([getPriceRules(nextToken), getPriceTiers(nextToken), getProducts(nextToken)]);
        setToken(nextToken);
        setPriceRules(priceRuleItems);
        setPriceTiers(priceTierItems);
        setProducts(productItems);
        const profile = getSessionProfile();
        setCanManage(profile === "admin" || profile === "manager");
        setMessage("Product price tiers loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load product price tiers.");
      }
    }

    void load();
  });

  const allProductRows = useMemo(() => {
    const grouped = new Map<string, PriceRuleSummary[]>();
    for (const rule of priceRules) {
      const current = grouped.get(rule.productId) ?? [];
      current.push(rule);
      grouped.set(rule.productId, current);
    }
    const productById = Object.fromEntries(products.map((product) => [product.id, product]));
    return Array.from(grouped.entries()).map(([productId, rules]) => {
      const sorted = [...rules].sort((left, right) => new Date(left.effectiveFrom).getTime() - new Date(right.effectiveFrom).getTime());
      const product = productById[productId];
      return {
        productId,
        productLabel: product ? `${product.productName} (${product.productCode})` : productId,
        tierAmount: rules.length,
        createdDate: sorted[0]?.effectiveFrom ?? new Date().toISOString(),
        owner: sorted[0]?.createdBy || "System"
      };
    })
      .sort((left, right) => left.productLabel.localeCompare(right.productLabel));
  }, [priceRules, products]);

  const productRows = useMemo(() => {
    return allProductRows
      .filter((item) => item.productLabel.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((left, right) => left.productLabel.localeCompare(right.productLabel));
  }, [allProductRows, search]);

  const assignedProductIds = useMemo(() => new Set(allProductRows.map((item) => item.productId)), [allProductRows]);
  const availableProducts = useMemo(
    () => products.filter((product) => !assignedProductIds.has(product.id)).sort((left, right) => left.productName.localeCompare(right.productName)),
    [assignedProductIds, products]
  );
  const priceTierById = useMemo(() => Object.fromEntries(priceTiers.map((tier) => [tier.id, tier])), [priceTiers]);
  const productById = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const exportRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return priceRules
      .map((rule) => {
        const product = productById[rule.productId];
        const tier = rule.priceTierId ? priceTierById[rule.priceTierId] : undefined;
        return {
          productName: product?.productName ?? rule.productId,
          productCode: product?.productCode ?? "",
          priceTier: tier ? `${tier.tier} - ${tier.name}` : "",
          standardPrice: rule.standardPrice,
          discountLimitPercent: rule.discountLimitPercent,
          createdDate: formatDate(rule.effectiveFrom),
          owner: rule.createdBy || "System"
        };
      })
      .filter((row) => (!query ? true : `${row.productName} ${row.productCode}`.toLowerCase().includes(query)));
  }, [priceRules, productById, priceTierById, search]);

  const priceTierExportColumns = [
    { key: "productName", label: "Product Name" },
    { key: "productCode", label: "Product Code" },
    { key: "priceTier", label: "Price Tier" },
    { key: "standardPrice", label: "Standard Price" },
    { key: "discountLimitPercent", label: "Discount Limit %" },
    { key: "createdDate", label: "Create Date" },
    { key: "owner", label: "Owner" }
  ] as const;

  function toggleExportColumn(columnKey: string) {
    setSelectedExportColumns((current) =>
      current.includes(columnKey) ? current.filter((item) => item !== columnKey) : [...current, columnKey]
    );
  }

  function exportPriceTiersCsv() {
    if (selectedExportColumns.length === 0) {
      setMessage("Select at least one column to export.");
      return;
    }
    const headerMap = Object.fromEntries(priceTierExportColumns.map((column) => [column.key, column.label]));
    const rows = [
      selectedExportColumns.map((column) => headerMap[column] ?? column),
      ...exportRows.map((row) =>
        selectedExportColumns.map((column) => {
          switch (column) {
            case "productName":
              return row.productName;
            case "productCode":
              return row.productCode;
            case "priceTier":
              return row.priceTier;
            case "standardPrice":
              return String(row.standardPrice);
            case "discountLimitPercent":
              return String(row.discountLimitPercent);
            case "createdDate":
              return row.createdDate;
            case "owner":
              return row.owner;
            default:
              return "";
          }
        })
      )
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-price-tiers-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
    setMessage("Product price tiers report exported.");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = String(form.get("productId") ?? "").trim();
    const priceTierId = String(form.get("priceTierId") ?? "").trim();
    const standardPrice = Number(form.get("standardPrice") ?? 0);
    const discountLimitPercent = Number(form.get("discountLimitPercent") ?? 0);

    if (!productId || !priceTierId || standardPrice <= 0) {
      setMessage("Product, price tier, and standard price are required.");
      return;
    }

    try {
      const created = await createPriceRule(token, {
        productId,
        taxCodeId: DEFAULT_TAX_CODE_ID,
        priceTierId,
        standardPrice,
        discountLimitPercent
      });
      setPriceRules((current) => [created, ...current]);
      setMessage("Product price tier saved to backend.");
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product price tier.");
    }
  }

  return (
    <AppShell
      active="/product-price-tiers"
      headerActions={
        <>
          <button className="button" type="button" onClick={() => setIsExportModalOpen(true)}>Export</button>
          <button className="button primary" type="button" onClick={() => setIsModalOpen(true)} disabled={!canManage || availableProducts.length === 0 || priceTiers.length === 0}>New Product Price Tiers</button>
        </>
      }
    >
      <div className="topbar">
        <div>
          <h1 className="title">Product Price Tiers</h1>
          <p className="subtitle">Manage price tiers grouped by product.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      <div className="filters" style={{ gridTemplateColumns: "minmax(280px, 1fr)" }}>
        <label className="field dashboard-search">
          <span>Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product name or code"
          />
        </label>
      </div>
      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={handleCreate}>
            <div className="panel-heading">
              <h2>New Product Price Tiers</h2>
              <button className="button compact" type="button" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            <label className="field">
              <span>Product</span>
              <select name="productId" defaultValue="" required>
                <option value="">Select product</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>{product.productName} ({product.productCode})</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Price Tiers</span>
              <select name="priceTierId" defaultValue="" required>
                <option value="">Select price tier</option>
                {priceTiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>{tier.tier} - {tier.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Standard Price</span>
              <input name="standardPrice" type="number" min="0" step="0.01" placeholder="0.00" required />
            </label>
            <label className="field">
              <span>Discount Limit %</span>
              <input name="discountLimitPercent" type="number" min="0" step="0.01" placeholder="0" />
            </label>
            <div className="toolbar">
              <button className="button primary" type="submit">Save Price Tier</button>
            </div>
          </form>
        </div>
      ) : null}
      {isExportModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <div className="panel-heading">
              <h2>Export Product Price Tiers CSV</h2>
              <button className="button compact" type="button" onClick={() => setIsExportModalOpen(false)}>Close</button>
            </div>
            <div className="checkbox-grid">
              {priceTierExportColumns.map((column) => (
                <label className="checkbox-field" key={column.key}>
                  <input
                    type="checkbox"
                    checked={selectedExportColumns.includes(column.key)}
                    onChange={() => toggleExportColumn(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>
            <div className="toolbar">
              <button className="button primary" type="button" onClick={exportPriceTiersCsv}>Download CSV</button>
            </div>
          </div>
        </div>
      ) : null}
      <DataTable
        headers={["Product Name(code)", "Tier Amount", "CreateDate", "Owner", "Action"]}
        rows={productRows.map((item) => [
          item.productLabel,
          String(item.tierAmount),
          formatDate(item.createdDate),
          item.owner,
          <Link className="button compact" href={`/product-price-tiers/${item.productId}`} key={item.productId}>Details</Link>
        ])}
      />
    </AppShell>
  );
}
