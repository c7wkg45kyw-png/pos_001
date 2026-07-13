"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createPriceRule, deletePriceRule, getPriceRules, getPriceTiers, getProducts, getSessionProfile, requireSessionToken } from "@/services/api";
import type { PriceRuleSummary, PriceTierSummary, ProductSummary } from "@/types/models";
import { formatCurrency, formatDate } from "@/utils/format";

const DEFAULT_TAX_CODE_ID = "e6febaa4-5033-4f2b-a631-c1cba72681ea";

export default function ProductPriceTierDetailsPage() {
  const params = useParams<{ id: string }>();
  const [priceRules, setPriceRules] = useState<PriceRuleSummary[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTierSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [token, setToken] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("Loading product price tier details...");

  useEffectOnce(() => {
    async function load() {
      try {
        const token = requireSessionToken();
        const [priceRuleItems, priceTierItems, productItems] = await Promise.all([getPriceRules(token), getPriceTiers(token), getProducts(token)]);
        setToken(token);
        setPriceRules(priceRuleItems);
        setPriceTiers(priceTierItems);
        setProducts(productItems);
        const profile = getSessionProfile();
        setCanManage(profile === "admin" || profile === "manager");
        setMessage("Product price tier details loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load product price tier details.");
      }
    }

    void load();
  });

  const product = useMemo(() => products.find((item) => item.id === params.id) ?? null, [products, params.id]);
  const productRules = useMemo(
    () => priceRules.filter((rule) => rule.productId === params.id).sort((left, right) => left.standardPrice - right.standardPrice),
    [priceRules, params.id]
  );
  const tierById = useMemo(() => Object.fromEntries(priceTiers.map((tier) => [tier.id, tier])), [priceTiers]);
  const availableTiers = useMemo(() => {
    const usedTierIds = new Set(productRules.map((rule) => rule.priceTierId).filter(Boolean));
    return priceTiers.filter((tier) => !usedTierIds.has(tier.id)).sort((left, right) => left.tier.localeCompare(right.tier));
  }, [priceTiers, productRules]);

  const rows = useMemo(() => {
    return productRules.map((rule) => [
        rule.priceTierId && tierById[rule.priceTierId] ? `${tierById[rule.priceTierId].tier} - ${tierById[rule.priceTierId].name}` : "Unassigned tier",
        formatCurrency(rule.standardPrice),
        `${rule.discountLimitPercent}%`,
        formatDate(rule.effectiveFrom),
        rule.createdBy || "System",
        <button
          key={rule.id}
          className="button compact danger"
          type="button"
          disabled={!canManage}
          onClick={() => void handleDelete(rule.id)}
        >
          Delete
        </button>
      ]);
  }, [canManage, productRules, tierById]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const priceTierId = String(form.get("priceTierId") ?? "").trim();
    const standardPrice = Number(form.get("standardPrice") ?? 0);
    const discountLimitPercent = Number(form.get("discountLimitPercent") ?? 0);

    if (!priceTierId || standardPrice <= 0) {
      setMessage("Price tier and standard price are required.");
      return;
    }

    try {
      const created = await createPriceRule(token, {
        productId: params.id,
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

  async function handleDelete(ruleId: string) {
    try {
      await deletePriceRule(token, ruleId);
      setPriceRules((current) => current.filter((rule) => rule.id !== ruleId));
      setMessage("Product price tier deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete product price tier.");
    }
  }

  return (
    <AppShell active="/product-price-tiers">
      <div className="topbar">
        <div>
          <h1 className="title">Product Price Tier Details</h1>
          <p className="subtitle">{product ? `${product.productName} (${product.productCode})` : params.id}</p>
        </div>
        <div className="toolbar">
          <button className="button primary" type="button" onClick={() => setIsModalOpen(true)} disabled={!canManage || availableTiers.length === 0}>
            New Price Tiers
          </button>
          <Link className="button" href="/product-price-tiers">Back</Link>
        </div>
      </div>
      <div className="notice">{message}</div>
      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={handleCreate}>
            <div className="panel-heading">
              <h2>New Price Tiers</h2>
              <button className="button compact" type="button" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            <label className="field">
              <span>Price Tiers</span>
              <select name="priceTierId" defaultValue="" required>
                <option value="">Select Price Tiers</option>
                {availableTiers.map((tier) => (
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
      <DataTable headers={["Tier", "Standard Price", "Discount Limit", "CreateDate", "Owner", "Action"]} rows={rows} />
    </AppShell>
  );
}
