"use client";

import type { ThemeConfigSummary } from "@/types/models";

const sessionThemeKey = "qms.session.theme";

export const themeFieldKeys = [
  "bg",
  "surface",
  "surfaceAlt",
  "text",
  "muted",
  "border",
  "primary",
  "primarySoft",
  "warning",
  "danger",
  "success",
  "shadow"
] as const;

export type ThemeFieldKey = typeof themeFieldKeys[number];

export function applyTheme(theme: ThemeConfigSummary) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--surface-alt", theme.surfaceAlt);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-soft", theme.primarySoft);
  root.style.setProperty("--warning", theme.warning);
  root.style.setProperty("--danger", theme.danger);
  root.style.setProperty("--success", theme.success);
  root.style.setProperty("--shadow", theme.shadow);
}

export function saveSessionTheme(theme: ThemeConfigSummary) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(sessionThemeKey, JSON.stringify(theme));
  applyTheme(theme);
}

export function getSessionTheme(): ThemeConfigSummary | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(sessionThemeKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as ThemeConfigSummary;
  } catch {
    return null;
  }
}

export function clearSessionTheme() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(sessionThemeKey);
}
