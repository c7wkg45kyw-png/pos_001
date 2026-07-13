"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { getPriceRules, getProducts, requireSessionToken } from "@/services/api";
import type { PriceRuleSummary, ProductSummary } from "@/types/models";
import { formatCurrency, formatDate } from "@/utils/format";

function parseTierIndex(value: string): number {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export default function PriceTierDetailsPage() {
  const params = useParams<{ tier: string }>();
  const [priceRules, setPriceRules] = useState<PriceRuleSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [message, setMessage] = useState("Loading price tier details...");

  useEffectOnce(() => {
    async function load() {
      try {
        const token = requireSessionToken();
        const [priceRuleItems, productItems] = await Promise.all([getPriceRules(token), getProducts(token)]);
        setPriceRules(priceRuleItems);
        setProducts(productItems);
        setMessage("Price tier details loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load price tier details.");
      }
    }

    void load();
  });

  const tierIndex = parseTierIndex(params.tier ?? "tier-0");
  const productById = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const rows = useMemo(() => {
    const grouped = new Map<string, PriceRuleSummary[]>();
    for (const rule of priceRules) {
      const current = grouped.get(rule.productId) ?? [];
      current.push(rule);
      grouped.set(rule.productId, current);
    }
    return Array.from(grouped.entries()).flatMap(([productId, rules]) => {
      const sorted = [...rules].sort((left, right) => left.standardPrice - right.standardPrice);
      const match = sorted[tierIndex];
      if (!match) {
        return [];
      }
      const product = productById[productId];
      return [[
        product ? `${product.productName} (${product.productCode})` : productId,
        formatCurrency(match.standardPrice),
        `${match.discountLimitPercent}%`,
        formatDate(match.effectiveFrom),
        match.createdBy || "System"
      ]];
    });
  }, [priceRules, productById, tierIndex]);

  return (
    <AppShell active="/price-tiers">
      <div className="topbar">
        <div>
          <h1 className="title">Price Tier Details</h1>
          <p className="subtitle">Tier {tierIndex}</p>
        </div>
        <Link className="button" href="/price-tiers">Back</Link>
      </div>
      <div className="notice">{message}</div>
      <DataTable headers={["Product", "Standard Price", "Discount Limit", "CreateDate", "Owner(CreateBy)"]} rows={rows} />
    </AppShell>
  );
}
