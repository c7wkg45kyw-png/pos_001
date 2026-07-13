"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { POSReceiptPreview } from "@/components/pos-receipt-preview";
import { getPOSTransactions, requireSessionToken, voidPOSTransaction } from "@/services/api";
import type { POSTransactionSummary } from "@/types/models";
import { formatCurrency, formatDateTimeSeconds } from "@/utils/format";

export default function POSOrdersPage() {
  const [records, setRecords] = useState<POSTransactionSummary[]>([]);
  const [message, setMessage] = useState("Loading POS orders...");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<POSTransactionSummary | null>(null);
  const [selectedReceiptMeta, setSelectedReceiptMeta] = useState<{
    currentPoints?: number;
    earnedPoints?: number;
    billDiscount?: number;
    specialDiscount?: number;
    appliedBenefits?: Array<{ benefitId: string; label: string; count: number; totalDiscount: number }>;
  } | null>(null);
  const [openActionId, setOpenActionId] = useState("");

  function openReceipt(item: POSTransactionSummary) {
    setSelectedReceipt(item);
    if (typeof window === "undefined") {
      setSelectedReceiptMeta(null);
      return;
    }
    const raw = window.localStorage.getItem(`pos-receipt:${item.transactionNumber}`);
    if (!raw) {
      setSelectedReceiptMeta({ currentPoints: 0, earnedPoints: 0, billDiscount: item.discount, specialDiscount: 0, appliedBenefits: [] });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        billDiscount?: number;
        specialDiscount?: number;
        currentPoints?: number;
        earnedPoints?: number;
        appliedBenefits?: Array<{ benefitId: string; label: string; count: number; totalDiscount: number }>;
      };
      setSelectedReceiptMeta(parsed);
    } catch {
      setSelectedReceiptMeta({ currentPoints: 0, earnedPoints: 0, billDiscount: item.discount, specialDiscount: 0, appliedBenefits: [] });
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const token = requireSessionToken();
        setRecords(await getPOSTransactions(token));
        setMessage("POS receipts loaded.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load POS receipts.");
      }
    }
    void load();
  }, []);

  async function handleVoid(item: POSTransactionSummary) {
    try {
      const token = requireSessionToken();
      const updated = await voidPOSTransaction(token, item.id, "Voided from POS Orders / Receipts");
      setRecords((current) => current.map((record) => record.id === item.id ? updated : record));
      setMessage(`${item.transactionNumber} voided.`);
      setOpenActionId("");
      if (selectedReceipt?.id === item.id) {
        setSelectedReceipt(updated);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not void receipt.");
    }
  }

  const paymentOptions = useMemo(
    () => ["all", ...Array.from(new Set(records.map((item) => item.paymentMethodName).filter(Boolean)))],
    [records]
  );

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
    return records.filter((item) => {
      const createdAt = new Date(item.createdAt);
      if (from && createdAt < from) {
        return false;
      }
      if (to && createdAt > to) {
        return false;
      }
      if (paymentFilter !== "all" && item.paymentMethodName !== paymentFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [item.customerName, item.cashierName, item.transactionNumber]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [dateFrom, dateTo, paymentFilter, records, search, statusFilter]);

  return (
    <AppShell active="/pos-orders">
      <div className="notice">{message}</div>
      <section className="section">
        <div className="card pos-orders-toolbar">
          <label className="field">
            <span>Date From</span>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </label>
          <label className="field">
            <span>Date To</span>
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </label>
          <label className="field">
            <span>Payment</span>
            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Payment" : option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Customer, cashier, or receipt"
            />
          </label>
        </div>
      </section>
      <DataTable
        headers={["Receipt", "Customer", "Cashier", "Payment", "Total", "Status", "Created", ""]}
        rows={visibleRecords.map((item) => [
          <button key={item.id} className="link-button" type="button" onClick={() => openReceipt(item)}>
            {item.transactionNumber}
          </button>,
          item.customerName,
          item.cashierName,
          item.paymentMethodName,
          formatCurrency(item.grandTotal),
          <span key={`${item.id}-status`} className={`chip pos-order-status-${item.status}`}>
            {item.status}
          </span>,
          formatDateTimeSeconds(item.createdAt),
          <div key={`${item.id}-actions`} className="pos-order-actions">
            <button
              className="button compact pos-order-action-trigger"
              type="button"
              onClick={() => setOpenActionId((current) => current === item.id ? "" : item.id)}
            >
              ...
            </button>
            {openActionId === item.id ? (
              <div className="pos-order-action-menu">
                <button className="link-button" type="button" onClick={() => { openReceipt(item); setOpenActionId(""); }}>
                  View
                </button>
                {item.status === "success" ? (
                  <button className="link-button pos-order-void-action" type="button" onClick={() => void handleVoid(item)}>
                    Void
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ])}
      />

      {selectedReceipt ? (
        <POSReceiptPreview
          receipt={selectedReceipt}
          items={(selectedReceipt.items ?? []).map((item) => ({
            id: item.id,
            productName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.totalPrice
          }))}
          customerName={selectedReceipt.customerName}
          paymentMethodName={selectedReceipt.paymentMethodName}
          currentPoints={selectedReceiptMeta?.currentPoints}
          earnedPoints={selectedReceiptMeta?.earnedPoints}
          billDiscount={selectedReceiptMeta?.billDiscount ?? selectedReceipt.discount}
          specialDiscount={selectedReceiptMeta?.specialDiscount}
          appliedBenefits={selectedReceiptMeta?.appliedBenefits}
          onClose={() => {
            setSelectedReceipt(null);
            setSelectedReceiptMeta(null);
          }}
        />
      ) : null}
    </AppShell>
  );
}
