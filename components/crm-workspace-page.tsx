"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";

export type CRMWorkspaceTab = {
  id: string;
  label: string;
  headline: string;
  summary: string;
  metrics: Array<{
    label: string;
    value: string;
    helper: string;
  }>;
  primaryList: Array<{
    title: string;
    meta: string;
    note: string;
  }>;
  secondaryList: Array<{
    title: string;
    value: string;
  }>;
  renderContent?: () => ReactNode;
};

export function CRMWorkspacePage({
  active,
  sectionTitle,
  sectionDescription,
  tabs
}: {
  active: string;
  sectionTitle: string;
  sectionDescription: string;
  tabs: CRMWorkspaceTab[];
}) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs]
  );

  if (!activeTab) {
    return null;
  }

  return (
    <AppShell active={active}>

      <section className="section">
        <div className="crm-tabs" role="tablist" aria-label={`${sectionTitle} tabs`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab.id === tab.id}
              className={`crm-tab ${activeTab.id === tab.id ? "is-active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab.metrics.length > 0 ? (
        <section className="dashboard-grid crm-metrics-grid">
          {activeTab.metrics.map((metric) => (
            <article className="card metric-card crm-metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.helper}</small>
            </article>
          ))}
        </section>
      ) : null}

      <section className="section">
        {activeTab.renderContent ? (
          activeTab.renderContent()
        ) : (
          <div className="crm-layout">
            <article className="card crm-panel crm-panel-main">
              <div className="crm-panel-header">
                <div>
                  <h3>{activeTab.headline}</h3>
                  <p>{activeTab.summary}</p>
                </div>
              </div>

              <div className="crm-list">
                {activeTab.primaryList.map((item) => (
                  <article className="crm-list-item" key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.meta}</span>
                    </div>
                    <small>{item.note}</small>
                  </article>
                ))}
              </div>
            </article>

            <aside className="card crm-panel crm-panel-side">
              <div className="crm-panel-header">
                <div>
                  <h3>Signals</h3>
                  <p>Fast scan data points related to the active CRM workspace tab.</p>
                </div>
              </div>

              <div className="crm-secondary-list">
                {activeTab.secondaryList.map((item) => (
                  <div className="crm-secondary-item" key={item.title}>
                    <span>{item.title}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </section>
    </AppShell>
  );
}
