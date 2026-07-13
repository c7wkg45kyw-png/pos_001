"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { getCustomers, getPaymentMethods, getProducts, getPOSTransactions, requireSessionToken } from "@/services/api";
import type { CustomerSummary, PaymentMethodSummary, POSTransactionSummary, ProductSummary } from "@/types/models";
import { formatDateTime } from "@/utils/format";

type ShiftRecord = {
  id: string;
  shiftNumber: string;
  employeeName: string;
  terminalId: string;
  status: "OPEN" | "CLOSED";
  startAmount: number;
  currentCash: number;
  startTime: string;
  endTime: string;
  endAmountExpected: number;
  endAmountActual: number;
  endAmountDifference: number;
  closeNotes: string;
};

const SHIFT_STORAGE_KEY = "qms-pos-shifts-v1";

function formatPOSCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}

function sameDay(isoValue: string, targetDate: string) {
  return Boolean(isoValue) && isoValue.slice(0, 10) === targetDate;
}

function hourBucketLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export default function POSDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [transactions, setTransactions] = useState<POSTransactionSummary[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [message, setMessage] = useState("Loading POS dashboard...");
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = requireSessionToken();
        const [nextTransactions, nextCustomers, nextPaymentMethods, nextProducts] = await Promise.all([
          getPOSTransactions(token),
          getCustomers(token),
          getPaymentMethods(token),
          getProducts(token)
        ]);
        setTransactions(nextTransactions);
        setCustomers(nextCustomers);
        setPaymentMethods(nextPaymentMethods);
        setProducts(nextProducts);

        const rawShifts = window.localStorage.getItem(SHIFT_STORAGE_KEY);
        if (rawShifts) {
          try {
            setShifts(JSON.parse(rawShifts) as ShiftRecord[]);
          } catch {
            setShifts([]);
          }
        } else {
          setShifts([]);
        }

        setLastUpdatedAt(new Date().toISOString());
        setMessage("POS dashboard is ready.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load POS dashboard.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const customersById = useMemo(
    () => Object.fromEntries(customers.map((item) => [item.id, item])),
    [customers]
  );

  const selectedTransactions = useMemo(
    () => transactions.filter((item) => sameDay(item.createdAt, selectedDate) && item.status === "success"),
    [selectedDate, transactions]
  );

  const previousTransactions = useMemo(
    () => transactions.filter((item) => sameDay(item.createdAt, yesterday) && item.status === "success"),
    [transactions, yesterday]
  );

  const netSales = selectedTransactions.reduce((sum, item) => sum + item.grandTotal, 0);
  const previousNetSales = previousTransactions.reduce((sum, item) => sum + item.grandTotal, 0);
  const salesDeltaPercent =
    previousNetSales === 0 ? (netSales > 0 ? 100 : 0) : ((netSales - previousNetSales) / previousNetSales) * 100;
  const averageBill = selectedTransactions.length === 0 ? 0 : netSales / selectedTransactions.length;

  const loyaltyCustomersToday = selectedTransactions.filter((item) => {
    const customer = customersById[item.customerId];
    return customer && customer.accountCode !== "POS-WALKIN";
  }).length;

  const newCustomersToday = customers.filter((item) => item.createdAt && sameDay(item.createdAt, selectedDate)).length;

  const shiftsForDate = useMemo(
    () => shifts.filter((item) => sameDay(item.startTime, selectedDate) || (item.endTime && sameDay(item.endTime, selectedDate))),
    [selectedDate, shifts]
  );

  const cashVariance = shiftsForDate.reduce((sum, item) => sum + item.endAmountDifference, 0);
  const varianceShift = shiftsForDate.find((item) => item.endAmountDifference !== 0) ?? shiftsForDate[0] ?? null;

  const hourlySeries = useMemo(() => {
    const points = Array.from({ length: 13 }, (_, index) => {
      const hour = index + 8;
      const total = selectedTransactions
        .filter((item) => new Date(item.createdAt).getHours() === hour)
        .reduce((sum, item) => sum + item.grandTotal, 0);
      return { hour, label: hourBucketLabel(hour), total };
    });
    const peak = Math.max(...points.map((item) => item.total), 1);
    return points.map((point, index) => ({
      ...point,
      x: (index / Math.max(points.length - 1, 1)) * 100,
      y: 100 - (point.total / peak) * 100
    }));
  }, [selectedTransactions]);

  const hourlyPath = hourlySeries.map((point) => `${point.x},${point.y}`).join(" ");

  const paymentBreakdown = useMemo(() => {
    return paymentMethods
      .map((method) => {
        const total = selectedTransactions
          .filter((item) => item.paymentMethodId === method.id)
          .reduce((sum, item) => sum + item.grandTotal, 0);
        return {
          id: method.id,
          label: method.englishName || method.thaiName,
          total,
          share: netSales === 0 ? 0 : (total / netSales) * 100
        };
      })
      .filter((item) => item.total > 0)
      .sort((left, right) => right.total - left.total);
  }, [netSales, paymentMethods, selectedTransactions]);

  const productSales = useMemo(() => {
    const map = new Map<string, { productCode: string; itemName: string; quantity: number; total: number }>();
    selectedTransactions.forEach((transaction) => {
      transaction.items?.forEach((item) => {
        const current = map.get(item.productId) ?? {
          productCode: item.productCode,
          itemName: item.itemName,
          quantity: 0,
          total: 0
        };
        current.quantity += item.quantity;
        current.total += item.totalPrice;
        map.set(item.productId, current);
      });
    });
    return Array.from(map.entries()).map(([productId, value]) => ({ productId, ...value }));
  }, [selectedTransactions]);

  const bestSellers = productSales
    .slice()
    .sort((left, right) => right.total - left.total)
    .slice(0, 5);

  const lowStockAlerts = productSales
    .slice()
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5)
    .map((item, index) => {
      const product = products.find((entry) => entry.id === item.productId);
      const estimatedRemaining = Math.max(1, 5 - index - Math.floor(item.quantity / 8));
      return {
        productName: product?.productName || item.itemName,
        remaining: estimatedRemaining,
        status: estimatedRemaining <= 2 ? "Critical" : "Low"
      };
    });

  const activeTerminals = shiftsForDate
    .slice()
    .sort((left, right) => (left.status === right.status ? 0 : left.status === "OPEN" ? -1 : 1))
    .map((shift) => {
      const terminalSales = selectedTransactions.reduce((sum, item) => sum + item.grandTotal, 0);
      return {
        ...shift,
        terminalSales
      };
    });

  return (
    <AppShell active="/pos-dashboard">
      <div className="notice">{message}</div>

      <section className="section">
        <div className="card pos-dashboard-topbar">
          <div>
            <h2>POS Dashboard</h2>
            <p>Merchant A · executive view across terminals, cash control, and front-store sell-through.</p>
          </div>
          <div className="pos-dashboard-topbar-meta">
            <label className="field-pos-dashboard-date">
              <span>Date</span>
              <input type="date" value={selectedDate} max={today} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
          </div>
        </div>
      </section>

      <section className="dashboard-grid pos-dashboard-kpi-grid">
        <article className="card metric-card pos-kpi-card">
          <span>Net Sales Today</span>
          <strong>{formatPOSCurrency(netSales)}</strong>
          <small>{loading ? "..." : `${formatPercent(salesDeltaPercent)} vs yesterday`}</small>
        </article>
        <article className="card metric-card pos-kpi-card">
          <span>Transactions</span>
          <strong>{selectedTransactions.length}</strong>
          <small>{loading ? "..." : `${formatPOSCurrency(averageBill)} average / bill`}</small>
        </article>
        <article className="card metric-card pos-kpi-card">
          <span>Loyalty Customers Today</span>
          <strong>{loyaltyCustomersToday}</strong>
          <small>{loading ? "..." : `New customers: ${newCustomersToday}`}</small>
        </article>
        <article className={`card metric-card pos-kpi-card ${cashVariance < 0 ? "is-negative" : cashVariance > 0 ? "is-warning" : ""}`}>
          <span>Cash Drawer Variance</span>
          <strong>{cashVariance === 0 ? formatPOSCurrency(0) : `${cashVariance < 0 ? "-" : "+"}${formatPOSCurrency(Math.abs(cashVariance))}`}</strong>
          <small>{varianceShift ? `From ${varianceShift.shiftNumber}` : "No shift variance recorded"}</small>
        </article>
      </section>

      <section className="section">
        <div className="pos-dashboard-layout">
          <div className="pos-dashboard-main">
            <article className="card pos-dashboard-panel">
              <div className="pos-dashboard-panel-header">
                <div>
                  <h3>Hourly Sales Trend</h3>
                  <p>Scan the day’s peak hours across store traffic and cashier load.</p>
                </div>
              </div>
              <div className="pos-sales-chart">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pos-sales-chart-svg" aria-hidden="true">
                  <polyline points={hourlyPath} className="pos-sales-chart-line" />
                </svg>
                <div className="pos-sales-chart-axis">
                  {hourlySeries.map((point) => (
                    <span key={point.label}>{point.label}</span>
                  ))}
                </div>
              </div>
            </article>

            <article className="card pos-dashboard-panel">
              <div className="pos-dashboard-panel-header">
                <div>
                  <h3>Low Stock Alert</h3>
                  <p>Fast-moving items derived from today’s POS demand that may need replenishment next.</p>
                </div>
              </div>
              <div className="pos-dashboard-table">
                <div className="pos-dashboard-table-head">
                  <span>Product</span>
                  <span>Remaining</span>
                  <span>Status</span>
                </div>
                {lowStockAlerts.map((item) => (
                  <div className="pos-dashboard-table-row" key={item.productName}>
                    <strong>{item.productName}</strong>
                    <span>{item.remaining}</span>
                    <span className={`chip ${item.status === "Critical" ? "pos-stock-critical" : "pos-stock-low"}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="pos-dashboard-side">
            <article className="card pos-dashboard-panel">
              <div className="pos-dashboard-panel-header">
                <div>
                  <h3>Payment Methods</h3>
                  <p>Track payment mix for cash handling and settlement planning.</p>
                </div>
              </div>
              <div className="pos-payment-breakdown">
                {paymentBreakdown.map((item) => (
                  <div className="pos-payment-row" key={item.id}>
                    <div className="pos-payment-meta">
                      <strong>{item.label}</strong>
                      <span>{item.share.toFixed(0)}% · {formatPOSCurrency(item.total)}</span>
                    </div>
                    <div className="training-progress-track">
                      <div className="training-progress-fill tone-primary" style={{ width: `${item.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="card pos-dashboard-panel">
              <div className="pos-dashboard-panel-header">
                <div>
                  <h3>Top 5 Best Sellers</h3>
                  <p>Revenue ranking based on item snapshots captured in today’s POS receipts.</p>
                </div>
              </div>
              <div className="pos-best-sellers">
                {bestSellers.map((item, index) => (
                  <div className="pos-best-seller-row" key={`${item.productId}-${index}`}>
                    <div>
                      <strong>{index + 1}. {item.itemName}</strong>
                      <span>{item.quantity} units</span>
                    </div>
                    <strong>{formatPOSCurrency(item.total)}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="card pos-dashboard-panel">
              <div className="pos-dashboard-panel-header">
                <div>
                  <h3>Active Terminals &amp; Shifts</h3>
                  <p>Monitor terminal readiness, cashier status, and shift movement by day.</p>
                </div>
              </div>
              <div className="pos-terminal-status-list">
                {activeTerminals.map((shift) => (
                  <div className="pos-terminal-status-item" key={shift.id}>
                    <div>
                      <strong>{shift.terminalId} · {shift.employeeName}</strong>
                      <span>{shift.status === "OPEN" ? "OPEN" : "CLOSED"} · {shift.shiftNumber}</span>
                    </div>
                    <strong>{formatPOSCurrency(shift.terminalSales)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
