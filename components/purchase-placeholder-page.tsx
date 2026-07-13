"use client";

import { AppShell } from "@/components/app-shell";

export function PurchasePlaceholderPage({
  active,
  sectionTitle,
  sectionDescription
}: {
  active: string;
  sectionTitle: string;
  sectionDescription: string;
}) {
  return (
    <AppShell active={active}>
      <div className="topbar">
        <div>
          <h1 className="title">{sectionTitle}</h1>
          <p className="subtitle">{sectionDescription}</p>
        </div>
      </div>

      <section className="section">
        <div className="card">
          <h2>{sectionTitle}</h2>
          <p>{sectionDescription}</p>
        </div>
      </section>
    </AppShell>
  );
}
