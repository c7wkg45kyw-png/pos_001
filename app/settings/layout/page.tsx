"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { clearSessionLayout, getDefaultLayout, getSessionLayout, layoutConfigs, saveSessionLayout, type LayoutConfig } from "@/services/layout";

export default function LayoutSettingsPage() {
  const [selectedLayoutId, setSelectedLayoutId] = useState<LayoutConfig["id"]>("default");
  const [currentLayoutId, setCurrentLayoutId] = useState<LayoutConfig["id"]>("default");
  const [message, setMessage] = useState("Default layout is active.");

  useEffectOnce(() => {
    const activeLayout = getSessionLayout() ?? getDefaultLayout();
    setSelectedLayoutId(activeLayout.id);
    setCurrentLayoutId(activeLayout.id);
    setMessage(`${activeLayout.layoutName} layout is active.`);
  });

  const selectedLayout = useMemo(
    () => layoutConfigs.find((layout) => layout.id === selectedLayoutId) ?? getDefaultLayout(),
    [selectedLayoutId]
  );

  function applySelectedLayout(layout: LayoutConfig) {
    saveSessionLayout(layout);
    setSelectedLayoutId(layout.id);
    setCurrentLayoutId(layout.id);
    setMessage(`${layout.layoutName} layout applied.`);
  }

  function restoreDefaultLayout() {
    clearSessionLayout();
    const defaultLayout = getDefaultLayout();
    setSelectedLayoutId(defaultLayout.id);
    setCurrentLayoutId(defaultLayout.id);
    setMessage("Default layout restored.");
  }

  return (
    <AppShell
      active="/settings/layout"
      headerActions={
        <button className="button primary" type="button" onClick={() => applySelectedLayout(selectedLayout)}>
          Apply Layout
        </button>
      }
    >
      <div className="topbar">
        <div>
          <h1 className="title">Layout</h1>
          <p className="subtitle">Manage workspace layout density. The current POS001 layout is Default.</p>
        </div>
      </div>
      <div className="notice">{message}</div>

      <section className="theme-controls-row">
        <label className="field theme-select-field">
          <span>Select Layout</span>
          <select value={selectedLayoutId} onChange={(event) => setSelectedLayoutId(event.target.value as LayoutConfig["id"])}>
            {layoutConfigs.map((layout) => (
              <option value={layout.id} key={layout.id}>
                {layout.layoutName}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="button" onClick={() => applySelectedLayout(selectedLayout)}>
          Apply
        </button>
        <button className="button" type="button" onClick={restoreDefaultLayout}>
          Default
        </button>
      </section>

      <section className="theme-preview-grid">
        <article className="card theme-preview-card layout-preview-card">
          <div className="theme-preview-name">
            <h2>{selectedLayout.layoutName}</h2>
            <p className="muted-text">{selectedLayout.description}</p>
            <div className="row-actions">
              {selectedLayout.id === currentLayoutId ? <span className="theme-badge">Active</span> : null}
              {selectedLayout.isDefault ? <span className="theme-badge">Default</span> : null}
            </div>
          </div>
          <div className="layout-spec-grid">
            <div>
              <span>Shell</span>
              <strong>{selectedLayout.shellWidth}</strong>
            </div>
            <div>
              <span>Content</span>
              <strong>{selectedLayout.contentPadding}</strong>
            </div>
            <div>
              <span>Cards</span>
              <strong>{selectedLayout.cardPadding}</strong>
            </div>
            <div>
              <span>Tables</span>
              <strong>{selectedLayout.tableDensity}</strong>
            </div>
          </div>
        </article>

        <article className={`card layout-workspace-preview layout-preview-${selectedLayout.id}`}>
          <div className="layout-preview-shell">
            <aside className="layout-preview-sidebar">
              <span />
              <span />
              <span />
            </aside>
            <main className="layout-preview-main">
              <div className="layout-preview-header">
                <div>
                  <strong>POS Dashboard</strong>
                  <span>Layout preview</span>
                </div>
                <button className="button compact primary" type="button">New Sale</button>
              </div>
              <div className="layout-preview-metrics">
                <div><span>Net Sales</span><strong>฿14,570.00</strong></div>
                <div><span>Receipts</span><strong>118</strong></div>
                <div><span>Cash variance</span><strong>฿0.00</strong></div>
              </div>
              <div className="table-shell">
                <div className="sales-live-table-card">
                  <table className="sales-live-table sales-live-table-compact">
                    <thead>
                      <tr>
                        <th>Receipt</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>POS-0001</td>
                        <td>General Customer</td>
                        <td><span className="chip approved">Success</span></td>
                        <td>฿1,250.00</td>
                      </tr>
                      <tr>
                        <td>POS-0002</td>
                        <td>Member A</td>
                        <td><span className="chip sent">Paid</span></td>
                        <td>฿890.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
