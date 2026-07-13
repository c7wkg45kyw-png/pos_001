"use client";

import { FormEvent, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { createPriceTier, getPriceRules, getPriceTiers, getSessionProfile, requireSessionToken } from "@/services/api";
import type { PriceRuleSummary, PriceTierSummary } from "@/types/models";
import { formatDate } from "@/utils/format";

export default function PriceTiersPage() {
  const [priceTiers, setPriceTiers] = useState<PriceTierSummary[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRuleSummary[]>([]);
  const [token, setToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [message, setMessage] = useState("Loading price tiers...");

  useEffectOnce(() => {
    async function load() {
      try {
        const nextToken = requireSessionToken();
        const [tierItems, ruleItems] = await Promise.all([getPriceTiers(nextToken), getPriceRules(nextToken)]);
        setToken(nextToken);
        setPriceTiers(tierItems);
        setPriceRules(ruleItems);
        const profile = getSessionProfile();
        setCanManage(profile === "admin" || profile === "manager");
        setMessage("Price tiers loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load price tiers.");
      }
    }

    void load();
  });

  const productAmountsByTier = useMemo(() => {
    const counts = new Map<string, number>();
    for (const rule of priceRules) {
      if (!rule.priceTierId) {
        continue;
      }
      counts.set(rule.priceTierId, (counts.get(rule.priceTierId) ?? 0) + 1);
    }
    return counts;
  }, [priceRules]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const tier = String(form.get("tier") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();

    if (!tier || !name) {
      setMessage("Tier and name are required.");
      return;
    }

    try {
      const created = await createPriceTier(token, { tier, name });
      setPriceTiers((current) => [created, ...current]);
      setMessage("Price tier created successfully.");
      setIsModalOpen(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save price tier.");
    }
  }

  return (
    <AppShell
      active="/price-tiers"
      headerActions={<button className="button primary" type="button" onClick={() => setIsModalOpen(true)} disabled={!canManage}>New Price Tiers</button>}
    >
      <div className="topbar">
        <div>
          <h1 className="title">Price Tiers</h1>
          <p className="subtitle">Manage tier master data before assigning product pricing.</p>
        </div>
      </div>
      <div className="notice">{message}</div>
      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={handleCreate}>
            <div className="panel-heading">
              <h2>New Price Tier</h2>
              <button className="button compact" type="button" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            <label className="field">
              <span>Tier</span>
              <input name="tier" placeholder="Tier 0" autoFocus required />
            </label>
            <label className="field">
              <span>Name</span>
              <input name="name" placeholder="Base Price" required />
            </label>
            <div className="toolbar">
              <button className="button" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="button primary" type="submit">Save Price Tier</button>
            </div>
          </form>
        </div>
      ) : null}
      <DataTable
        headers={["Tier", "Name", "Products Amount", "CreateDate", "Owner"]}
        rows={priceTiers.map((item) => [
          item.tier,
          item.name,
          String(productAmountsByTier.get(item.id) ?? 0),
          formatDate(item.createdAt),
          item.createdBy
        ])}
      />
    </AppShell>
  );
}
