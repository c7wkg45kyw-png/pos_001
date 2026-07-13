"use client";

import { type CSSProperties, FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { useEffectOnce } from "@/hooks/use-effect-once";
import { getSessionProfile, getThemes, requireSessionToken, saveTheme } from "@/services/api";
import { applyTheme, getSessionTheme, saveSessionTheme, themeFieldKeys, type ThemeFieldKey } from "@/services/theme";
import type { ThemeConfigSummary } from "@/types/models";

type ThemeFormState = {
  id?: string;
  themeName: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primarySoft: string;
  warning: string;
  danger: string;
  success: string;
  shadow: string;
  isDefault: boolean;
  isActive: boolean;
};

const themeFieldLabels: Record<ThemeFieldKey, string> = {
  bg: "Background",
  surface: "Surface",
  surfaceAlt: "Surface Alt",
  text: "Text",
  muted: "Muted",
  border: "Border",
  primary: "Primary",
  primarySoft: "Primary Soft",
  warning: "Warning",
  danger: "Danger",
  success: "Success",
  shadow: "Shadow"
};

function initialThemeForm(): ThemeFormState {
  return {
    themeName: "",
    bg: "#f5f7f9",
    surface: "#ffffff",
    surfaceAlt: "#edf3f7",
    text: "#13212b",
    muted: "#586773",
    border: "#d6e0e7",
    primary: "#0f766e",
    primarySoft: "#d8f3f0",
    warning: "#b45309",
    danger: "#b42318",
    success: "#166534",
    shadow: "0 12px 32px rgba(17, 24, 39, 0.08)",
    isDefault: false,
    isActive: true
  };
}

function toFormState(theme: ThemeConfigSummary): ThemeFormState {
  return {
    id: theme.id,
    themeName: theme.themeName,
    bg: theme.bg,
    surface: theme.surface,
    surfaceAlt: theme.surfaceAlt,
    text: theme.text,
    muted: theme.muted,
    border: theme.border,
    primary: theme.primary,
    primarySoft: theme.primarySoft,
    warning: theme.warning,
    danger: theme.danger,
    success: theme.success,
    shadow: theme.shadow,
    isDefault: theme.isDefault,
    isActive: theme.isActive
  };
}

export default function ThemeSettingsPage() {
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState("");
  const [themes, setThemes] = useState<ThemeConfigSummary[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [currentThemeId, setCurrentThemeId] = useState("");
  const [form, setForm] = useState<ThemeFormState>(initialThemeForm());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("Loading themes...");

  useEffectOnce(() => {
    async function load() {
      try {
        const nextToken = requireSessionToken();
        setToken(nextToken);
        setProfile(getSessionProfile());
        const items = await getThemes(nextToken);
        setThemes(items);
        const activeTheme = getSessionTheme() ?? items.find((item) => item.isDefault) ?? items[0] ?? null;
        if (activeTheme) {
          applyTheme(activeTheme);
          setSelectedThemeId(activeTheme.id);
          setCurrentThemeId(activeTheme.id);
        } else if (items[0]) {
          setSelectedThemeId(items[0].id);
          setCurrentThemeId(items[0].id);
        }
        setMessage("Themes loaded from backend.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load themes.");
      }
    }
    void load();
  });

  const canManageThemes = profile === "admin" || profile === "manager";

  function openCreateModal() {
    setForm(initialThemeForm());
    setIsModalOpen(true);
  }

  function openEditModal(theme: ThemeConfigSummary) {
    setForm(toFormState(theme));
    setIsModalOpen(true);
  }

  function updateColorField(key: ThemeFieldKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitTheme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const saved = await saveTheme(token, {
        id: form.id,
        themeName: form.themeName,
        bg: form.bg,
        surface: form.surface,
        surfaceAlt: form.surfaceAlt,
        text: form.text,
        muted: form.muted,
        border: form.border,
        primary: form.primary,
        primarySoft: form.primarySoft,
        warning: form.warning,
        danger: form.danger,
        success: form.success,
        shadow: form.shadow,
        isDefault: form.isDefault,
        isActive: form.isActive
      });
      const nextThemes = form.id
        ? themes.map((item) => (item.id === saved.id ? saved : saved.isDefault ? { ...item, isDefault: false } : item))
        : [saved, ...themes.map((item) => (saved.isDefault ? { ...item, isDefault: false } : item))];
      setThemes(nextThemes);
      setSelectedThemeId(saved.id);
      setCurrentThemeId(saved.id);
      setIsModalOpen(false);
      setMessage(`${saved.themeName} saved.`);
      if (saved.isDefault || currentThemeId === saved.id) {
        saveSessionTheme(saved);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save theme.");
    }
  }

  async function useTheme(theme: ThemeConfigSummary) {
    try {
      const saved = await saveTheme(token, {
        id: theme.id,
        themeName: theme.themeName,
        bg: theme.bg,
        surface: theme.surface,
        surfaceAlt: theme.surfaceAlt,
        text: theme.text,
        muted: theme.muted,
        border: theme.border,
        primary: theme.primary,
        primarySoft: theme.primarySoft,
        warning: theme.warning,
        danger: theme.danger,
        success: theme.success,
        shadow: theme.shadow,
        isDefault: true,
        isActive: theme.isActive
      });
      const nextThemes = themes.map((item) => (item.id === saved.id ? saved : { ...item, isDefault: false }));
      setThemes(nextThemes);
      saveSessionTheme(saved);
      setSelectedThemeId(saved.id);
      setCurrentThemeId(saved.id);
      setMessage(`${saved.themeName} applied.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not apply theme.");
    }
  }

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? themes.find((theme) => theme.id === currentThemeId) ?? themes[0] ?? null,
    [currentThemeId, selectedThemeId, themes]
  );
  const selectedThemeSwatches = useMemo(
    () => selectedTheme
      ? [
          selectedTheme.bg,
          selectedTheme.surface,
          selectedTheme.surfaceAlt,
          selectedTheme.text,
          selectedTheme.muted,
          selectedTheme.border,
          selectedTheme.primary,
          selectedTheme.primarySoft,
          selectedTheme.warning,
          selectedTheme.danger,
          selectedTheme.success,
          selectedTheme.surface
        ]
      : [],
    [selectedTheme]
  );
  const previewThemeStyle = useMemo(
    () => selectedTheme
      ? ({
          "--bg": selectedTheme.bg,
          "--surface": selectedTheme.surface,
          "--surface-alt": selectedTheme.surfaceAlt,
          "--text": selectedTheme.text,
          "--muted": selectedTheme.muted,
          "--border": selectedTheme.border,
          "--primary": selectedTheme.primary,
          "--primary-soft": selectedTheme.primarySoft,
          "--warning": selectedTheme.warning,
          "--danger": selectedTheme.danger,
          "--success": selectedTheme.success,
          "--shadow": selectedTheme.shadow
        } as CSSProperties)
      : undefined,
    [selectedTheme]
  );

  return (
    <AppShell
      active="/settings/theme"
      headerActions={
        <button className="button primary" type="button" onClick={openCreateModal} disabled={!canManageThemes}>
          New Theme
        </button>
      }
    >
      <div className="topbar">
        <div>
          <h1 className="title">Theme</h1>
          <p className="subtitle">Manage UI themes and apply the selected palette after login.</p>
        </div>
      </div>
      <div className="notice">{message}</div>

      <section className="theme-controls-row">
        <label className="field theme-select-field">
          <span>Select Theme</span>
          <select value={selectedThemeId} onChange={(event) => setSelectedThemeId(event.target.value)}>
            {themes.map((theme) => (
              <option value={theme.id} key={theme.id}>
                {theme.themeName}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="button" onClick={() => selectedTheme && void useTheme(selectedTheme)} disabled={!selectedTheme}>
          Apply
        </button>
        <button className="button" type="button" onClick={() => themes[0] && void useTheme(themes.find((item) => item.isDefault) ?? themes[0])}>
          Default
        </button>
      </section>

      {selectedTheme ? (
        <section className="theme-preview-grid">
          <article className="card theme-preview-card">
            <div className="theme-preview-name">
              <h2>{selectedTheme.themeName}</h2>
              <div className="row-actions">
                {selectedTheme.id === currentThemeId ? <span className="theme-badge">Active</span> : null}
                {selectedTheme.isDefault ? <span className="theme-badge">Default</span> : null}
              </div>
            </div>
            <div className="theme-preview-swatches">
              {selectedThemeSwatches.map((color, index) => (
                <span
                  className="theme-preview-swatch"
                  key={`${selectedTheme.id}-${index}`}
                  style={index === selectedThemeSwatches.length - 1 ? { background: color, boxShadow: selectedTheme.shadow } : { background: color }}
                />
              ))}
            </div>
          </article>
          <article className="card theme-quotation-preview" style={previewThemeStyle}>
            <div className="theme-quotation-shell">
              <div className="theme-quotation-topbar">
                <div>
                  <h3>Quotations</h3>
                  <p>Create, revise, submit, and track quotations.</p>
                </div>
                <div className="theme-quotation-actions">
                  <button className="button" type="button">Export</button>
                  <Link className="button primary" href="#">
                    New Quotation
                  </Link>
                </div>
              </div>
              <div className="theme-quotation-filters">
                <label className="field">
                  <span>Date From</span>
                  <input type="date" value="2026-06-01" readOnly />
                </label>
                <label className="field">
                  <span>Date To</span>
                  <input type="date" value="2026-06-29" readOnly />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select value="all" disabled>
                    <option value="all">All Statuses</option>
                  </select>
                </label>
                <label className="field">
                  <span>Search</span>
                  <input value="QMS" readOnly />
                </label>
              </div>
              <div className="card" style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quotation</th>
                      <th>Customer</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>QT-2026-001</td>
                      <td>Acme Manufacturing</td>
                      <td>Sales A</td>
                      <td><span className="chip sent">Submitted</span></td>
                      <td>45,000.00</td>
                      <td>29 Jun 2026</td>
                      <td>
                        <div className="row-actions">
                          <button className="button compact" type="button">Details</button>
                          <button className="button compact primary" type="button">Submit</button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>QT-2026-002</td>
                      <td>Nova Retail</td>
                      <td>Sales B</td>
                      <td><span className="chip draft">Draft</span></td>
                      <td>18,750.00</td>
                      <td>28 Jun 2026</td>
                      <td>
                        <div className="row-actions">
                          <button className="button compact" type="button">Details</button>
                          <button className="button compact primary" type="button">Submit</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal modal-wide" onSubmit={submitTheme}>
            <div className="panel-heading">
              <h2>{form.id ? "Edit Theme" : "New Theme"}</h2>
              <button className="button compact" type="button" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            <div className="theme-form-grid">
              <label className="field">
                <span>Theme Name</span>
                <input value={form.themeName} onChange={(event) => setForm((current) => ({ ...current, themeName: event.target.value }))} required />
              </label>
              {themeFieldKeys.filter((key) => key !== "shadow").map((key) => (
                <label className="field" key={key}>
                  <span>{themeFieldLabels[key]}</span>
                  <input type="color" value={form[key]} onChange={(event) => updateColorField(key, event.target.value)} />
                </label>
              ))}
              <label className="field theme-shadow-field">
                <span>Shadow</span>
                <input value={form.shadow} onChange={(event) => setForm((current) => ({ ...current, shadow: event.target.value }))} required />
              </label>
              <label className="field checkbox-field">
                <span>Default Theme</span>
                <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} />
              </label>
              <label className="field checkbox-field">
                <span>Is Active</span>
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
              </label>
            </div>
            <div className="toolbar">
              <button className="button" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="button primary" type="submit">Save Theme</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
