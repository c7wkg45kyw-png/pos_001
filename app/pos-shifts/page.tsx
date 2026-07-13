"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { getSessionUser } from "@/services/api";
import { formatCurrency, formatDateTime } from "@/utils/format";

type ShiftStatus = "OPEN" | "CLOSED";

type ShiftRecord = {
  id: string;
  shiftNumber: string;
  employeeName: string;
  terminalId: string;
  status: ShiftStatus;
  startAmount: number;
  currentCash: number;
  startTime: string;
  endTime: string;
  endAmountExpected: number;
  endAmountActual: number;
  endAmountDifference: number;
  closeNotes: string;
};

const STORAGE_KEY = "qms-pos-shifts-v1";

function createId() {
  return `shift-${Math.random().toString(36).slice(2, 10)}`;
}

function formatShiftDateTime(value: string) {
  if (!value) {
    return "--";
  }
  return formatDateTime(value);
}

function seedShifts(currentUser: string): ShiftRecord[] {
  return [
    {
      id: createId(),
      shiftNumber: "#1004",
      employeeName: currentUser,
      terminalId: "POS-BKK-01",
      status: "OPEN",
      startAmount: 2000,
      currentCash: 14450,
      startTime: "2026-07-06T08:00:00.000Z",
      endTime: "",
      endAmountExpected: 0,
      endAmountActual: 0,
      endAmountDifference: 0,
      closeNotes: ""
    },
    {
      id: createId(),
      shiftNumber: "#1003",
      employeeName: "Somying Rakdee",
      terminalId: "POS-BKK-01",
      status: "CLOSED",
      startAmount: 2000,
      currentCash: 18200,
      startTime: "2026-07-05T01:00:00.000Z",
      endTime: "2026-07-05T13:00:00.000Z",
      endAmountExpected: 18200,
      endAmountActual: 18200,
      endAmountDifference: 0,
      closeNotes: "Balanced and dropped to safe."
    },
    {
      id: createId(),
      shiftNumber: "#1002",
      employeeName: "Somying Rakdee",
      terminalId: "POS-BKK-02",
      status: "CLOSED",
      startAmount: 2000,
      currentCash: 15630,
      startTime: "2026-07-04T01:00:00.000Z",
      endTime: "2026-07-04T13:00:00.000Z",
      endAmountExpected: 15630,
      endAmountActual: 15630,
      endAmountDifference: 0,
      closeNotes: "Closed on schedule."
    },
    {
      id: createId(),
      shiftNumber: "#1001",
      employeeName: currentUser,
      terminalId: "POS-BKK-01",
      status: "CLOSED",
      startAmount: 2000,
      currentCash: 12400,
      startTime: "2026-07-03T01:00:00.000Z",
      endTime: "2026-07-03T13:00:00.000Z",
      endAmountExpected: 12400,
      endAmountActual: 12400,
      endAmountDifference: 0,
      closeNotes: "Normal close."
    }
  ];
}

export default function POSShiftsPage() {
  const router = useRouter();
  const openingCashRef = useRef<HTMLInputElement | null>(null);
  const closingCashRef = useRef<HTMLInputElement | null>(null);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [currentUser, setCurrentUser] = useState("Cashier");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [modalMode, setModalMode] = useState<"open" | "close" | null>(null);
  const [openingCash, setOpeningCash] = useState("2000.0000");
  const [actualClosingCash, setActualClosingCash] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "OPEN" | "CLOSED">("all");

  useEffect(() => {
    const user = getSessionUser() || "Cashier";
    setCurrentUser(user);
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setShifts(JSON.parse(raw) as ShiftRecord[]);
        return;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    const seeded = seedShifts(user);
    setShifts(seeded);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  }, []);

  useEffect(() => {
    if (shifts.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
    }
  }, [shifts]);

  useEffect(() => {
    if (modalMode === "open") {
      openingCashRef.current?.focus();
    }
    if (modalMode === "close") {
      closingCashRef.current?.focus();
    }
  }, [modalMode]);

  const openShift = useMemo(
    () => shifts.find((item) => item.status === "OPEN") ?? null,
    [shifts]
  );

  const visibleShifts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return shifts.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      const startedAt = new Date(item.startTime);
      if (from && startedAt < from) {
        return false;
      }
      if (to && startedAt > to) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [item.employeeName, item.terminalId, item.shiftNumber]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [dateFrom, dateTo, search, shifts, statusFilter]);

  const summary = useMemo(() => {
    const openCount = shifts.filter((item) => item.status === "OPEN").length;
    const closedCount = shifts.filter((item) => item.status === "CLOSED").length;
    const totalDrawer = shifts.reduce((sum, item) => sum + item.currentCash, 0);
    return { openCount, closedCount, totalDrawer };
  }, [shifts]);

  function closeModal() {
    setModalMode(null);
    setMessage("");
    setOpeningCash("2000.0000");
    setActualClosingCash("");
    setCloseNotes("");
  }

  function openPrimaryAction() {
    if (openShift) {
      setActualClosingCash(openShift.currentCash.toFixed(2));
      setCloseNotes(openShift.closeNotes);
      setModalMode("close");
      return;
    }
    setOpeningCash("2000.0000");
    setModalMode("open");
  }

  function confirmOpenShift() {
    const amount = Number(openingCash);
    if (!Number.isFinite(amount) || amount < 0) {
      setMessage("Please enter a valid opening cash amount.");
      return;
    }
    const nextSequence = shifts.length + 1001;
    const nextRecord: ShiftRecord = {
      id: createId(),
      shiftNumber: `#${nextSequence}`,
      employeeName: currentUser,
      terminalId: "POS-BKK-01",
      status: "OPEN",
      startAmount: amount,
      currentCash: amount,
      startTime: new Date().toISOString(),
      endTime: "",
      endAmountExpected: 0,
      endAmountActual: 0,
      endAmountDifference: 0,
      closeNotes: ""
    };
    setShifts((current) => [nextRecord, ...current]);
    closeModal();
    router.push("/pos-terminal");
  }

  function confirmCloseShift() {
    if (!openShift) {
      setMessage("No active shift found.");
      return;
    }
    const actual = Number(actualClosingCash);
    if (!Number.isFinite(actual) || actual < 0) {
      setMessage("Please enter a valid closing cash amount.");
      return;
    }
    const expected = openShift.currentCash;
    const difference = actual - expected;
    setShifts((current) =>
      current.map((item) =>
        item.id === openShift.id
          ? {
            ...item,
            status: "CLOSED",
            endTime: new Date().toISOString(),
            endAmountExpected: expected,
            endAmountActual: actual,
            endAmountDifference: difference,
            closeNotes
          }
          : item
      )
    );
    closeModal();
  }

  const rows = visibleShifts.map((item) => [
    item.shiftNumber,
    item.employeeName,
    formatShiftDateTime(item.startTime),
    formatShiftDateTime(item.endTime),
    formatCurrency(item.startAmount),
    formatCurrency(item.currentCash),
    <span key={`${item.id}-status`} className={`chip pos-shift-status-${item.status.toLowerCase()}`}>
      {item.status}
    </span>
  ]);

  const headerActions = (
    <div className="row-actions">
      <button className="button primary" type="button" onClick={openPrimaryAction}>
        {openShift ? "View Current Shift / Close Shift" : "Open New Shift"}
      </button>
    </div>
  );

  return (
    <AppShell active="/pos-shifts" headerActions={headerActions}>
      {message ? (
        <section className="section">
          <div className="card notice">{message}</div>
        </section>
      ) : null}

      <section className="section">
        <div className="dashboard-grid pos-shift-metrics-grid">
          <article className="card metric-card">
            <span>Open Shift</span>
            <strong>{summary.openCount}</strong>
            <small>Active on this terminal group</small>
          </article>
          <article className="card metric-card">
            <span>Closed Shift</span>
            <strong>{summary.closedCount}</strong>
            <small>Historical shift logs</small>
          </article>
          <article className="card metric-card">
            <span>Drawer Cash</span>
            <strong>{formatCurrency(summary.totalDrawer)}</strong>
            <small>Combined across the visible log</small>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="card pos-shift-search-card">
          <div className="pos-shift-toolbar">
            <label className="field pos-shift-search-field">
              <span>Date From</span>
              <input type="datetime-local" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </label>
            <label className="field pos-shift-search-field">
              <span>Date To</span>
              <input type="datetime-local" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </label>
            <label className="field pos-shift-search-field">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "OPEN" | "CLOSED")}>
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>
            <label className="field pos-shift-search-field">
              <span>Search Shift History</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by employee or terminal ID"
              />
            </label>
          </div>
        </div>
      </section>
      

      <DataTable
        headers={["Shift", "Employee", "Start", "End", "Opening Cash", "Cash in Drawer", "Status"]}
        rows={rows}
        pageSize={8}
      />

      {modalMode ? (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div className="modal pos-shift-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            {modalMode === "open" ? (
              <>
                <div className="panel-heading">
                  <div>
                    <h2>Shift Initialization</h2>
                    <p className="muted">
                      Check the drawer float and enter the opening cash before the shift starts.
                    </p>
                  </div>
                </div>
                <div className="pos-shift-modal-body">
                  <label className="field">
                    <span>Opening Cash</span>
                    <input
                      ref={openingCashRef}
                      value={openingCash}
                      onChange={(event) => setOpeningCash(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          confirmOpenShift();
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="tests-modal-footer row-actions pos-shift-modal-footer">
                  <button className="button" type="button" onClick={closeModal}>
                    Back to Shift Log
                  </button>
                  <button className="button primary" type="button" onClick={confirmOpenShift}>
                    Confirm Open Shift
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="panel-heading">
                  <div>
                    <h2>Current Shift Control</h2>
                    <p className="muted">
                      Review the active drawer and close this shift when the cashier count is ready.
                    </p>
                  </div>
                  <span className="chip pos-shift-status-open">OPEN</span>
                </div>
                <div className="pos-shift-open-summary">
                  <div>
                    <span>Shift</span>
                    <strong>{openShift?.shiftNumber ?? "--"}</strong>
                  </div>
                  <div>
                    <span>Employee</span>
                    <strong>{openShift?.employeeName ?? "--"}</strong>
                  </div>
                  <div>
                    <span>Started</span>
                    <strong>{formatShiftDateTime(openShift?.startTime ?? "")}</strong>
                  </div>
                  <div>
                    <span>Expected Cash</span>
                    <strong>{formatCurrency(openShift?.currentCash ?? 0)}</strong>
                  </div>
                </div>
                <div className="pos-shift-modal-body">
                  <label className="field">
                    <span>Actual Closing Cash</span>
                    <input
                      ref={closingCashRef}
                      value={actualClosingCash}
                      onChange={(event) => setActualClosingCash(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Close Notes</span>
                    <textarea
                      rows={4}
                      value={closeNotes}
                      onChange={(event) => setCloseNotes(event.target.value)}
                      placeholder="Add discrepancy notes or safe-drop context"
                    />
                  </label>
                </div>
                <div className="tests-modal-footer row-actions pos-shift-modal-footer">
                  <button className="button" type="button" onClick={closeModal}>
                    Keep Shift Open
                  </button>
                  <button className="button primary" type="button" onClick={confirmCloseShift}>
                    Close Shift
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
