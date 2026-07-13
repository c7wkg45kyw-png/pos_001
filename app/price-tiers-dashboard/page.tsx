"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { getPriceRules, getPriceTiers, getProducts, requireSessionToken } from "@/services/api";
import type { PriceRuleSummary, PriceTierSummary, ProductSummary } from "@/types/models";

type TierRow = {
  rank: number;
  label: string;
  productTiers: number;
  owner: string;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export default function PriceTiersDashboardPage() {
  const [priceRules, setPriceRules] = useState<PriceRuleSummary[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTierSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [message, setMessage] = useState("Loading price tiers dashboard...");

  useEffectOnce(() => {
    async function load() {
      try {
        const token = requireSessionToken();
        const [priceRuleItems, priceTierItems, productItems] = await Promise.all([getPriceRules(token), getPriceTiers(token), getProducts(token)]);
        setPriceRules(priceRuleItems);
        setPriceTiers(priceTierItems);
        setProducts(productItems);
        if (priceRuleItems.length > 0) {
          const latest = [...priceRuleItems].sort((left, right) => new Date(right.effectiveFrom).getTime() - new Date(left.effectiveFrom).getTime())[0];
          const latestDate = new Date(latest.effectiveFrom);
          setDateFrom((current) => current || toDateInputValue(addMonths(latestDate, -1)));
          setDateTo((current) => current || toDateInputValue(latestDate));
        }
        setMessage("Price tiers dashboard loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load price tiers dashboard.");
      }
    }

    void load();
  });

  const filteredPriceRules = useMemo(() => {
    return priceRules.filter((rule) => {
      const effectiveFrom = rule.effectiveFrom.slice(0, 10);
      if (dateFrom && effectiveFrom < dateFrom) {
        return false;
      }
      if (dateTo && effectiveFrom > dateTo) {
        return false;
      }
      return true;
    });
  }, [dateFrom, dateTo, priceRules]);

  const productRuleGroups = useMemo(() => {
    const groups = new Map<string, PriceRuleSummary[]>();
    for (const rule of filteredPriceRules) {
      const current = groups.get(rule.productId) ?? [];
      current.push(rule);
      groups.set(rule.productId, current);
    }
    return groups;
  }, [filteredPriceRules]);
  const tierById = useMemo(() => Object.fromEntries(priceTiers.map((tier) => [tier.id, tier])), [priceTiers]);

  const singleTierProducts = useMemo(() => Array.from(productRuleGroups.values()).filter((rules) => rules.length === 1).length, [productRuleGroups]);
  const multiTierProducts = useMemo(() => Array.from(productRuleGroups.values()).filter((rules) => rules.length > 1).length, [productRuleGroups]);
  const pricedProductCount = productRuleGroups.size;
  const unpricedProductCount = Math.max(products.length - pricedProductCount, 0);

  const topPriceTiers = useMemo<TierRow[]>(() => {
    const tiers = new Map<string, { label: string; count: number; productIds: Set<string>; owner: string }>();
    for (const rule of filteredPriceRules) {
      if (!rule.priceTierId || !tierById[rule.priceTierId]) {
        continue;
      }
      const tier = tierById[rule.priceTierId];
      const current = tiers.get(rule.priceTierId) ?? {
        label: `${tier.tier} - ${tier.name}`,
        count: 0,
        productIds: new Set<string>(),
        owner: rule.createdBy || "System"
      };
      current.count += 1;
      current.productIds.add(rule.productId);
      if (!current.owner) {
        current.owner = rule.createdBy || "System";
      }
      tiers.set(rule.priceTierId, current);
    }
    return Array.from(tiers.entries())
      .map(([, item]) => ({
        rank: 0,
        label: item.label,
        productTiers: item.productIds.size,
        owner: item.owner || "System"
      }))
      .sort((left, right) => right.productTiers - left.productTiers || left.label.localeCompare(right.label))
      .slice(0, 5)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [filteredPriceRules, tierById]);

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
    <AppShell active="/price-tiers-dashboard">
      <div className="topbar">
        <div>
          <h1 className="title">Price Tiers Dashboard</h1>
          <p className="subtitle">Review how many products use single-tier pricing and multi-tier pricing.</p>
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
          <div className="metric-label">Prices (Single Tier / Tier 0)</div>
          <div className="metric-value">{singleTierProducts}</div>
        </div>
        <div className="card metric">
          <div className="metric-label">Prices (More Than 1 Tier)</div>
          <div className="metric-value">{multiTierProducts}</div>
        </div>
        <div className="card metric">
          <div className="metric-label">Price Tier Amount</div>
          <div className="metric-value">{pricedProductCount} / {unpricedProductCount}</div>
        </div>
      </div>
      <section className="section">
        <h2>Top 5 Price Tiers</h2>
      </section>
      <DataTable
        headers={["Rank", "PriceTier", "ProductTiers", "Owner(CreateBy)"]}
        rows={topPriceTiers.map((item) => [String(item.rank), item.label, String(item.productTiers), item.owner])}
        pagination={false}
      />
    </AppShell>
  );
}
