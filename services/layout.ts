"use client";

export type LayoutDensity = "default" | "compact" | "comfortable" | "enterprise";

export type LayoutConfig = {
  id: LayoutDensity;
  layoutName: string;
  description: string;
  shellWidth: string;
  contentPadding: string;
  cardPadding: string;
  tableDensity: string;
  isDefault: boolean;
};

const sessionLayoutKey = "pos001.session.layout";

export const layoutConfigs: LayoutConfig[] = [
  {
    id: "default",
    layoutName: "Default",
    description: "Current POS001 layout with balanced spacing and the standard workspace density.",
    shellWidth: "Standard",
    contentPadding: "Balanced",
    cardPadding: "Standard",
    tableDensity: "Standard",
    isDefault: true
  },
  {
    id: "compact",
    layoutName: "Compact",
    description: "Tighter spacing for dense operational screens and more visible rows per viewport.",
    shellWidth: "Wide",
    contentPadding: "Compact",
    cardPadding: "Compact",
    tableDensity: "Compact",
    isDefault: false
  },
  {
    id: "comfortable",
    layoutName: "Comfortable",
    description: "More breathing room for touchscreen use and easier scanning across POS workflows.",
    shellWidth: "Standard",
    contentPadding: "Relaxed",
    cardPadding: "Relaxed",
    tableDensity: "Comfortable",
    isDefault: false
  },
  {
    id: "enterprise",
    layoutName: "Enterprise",
    description: "Dark left navigation, white top bar, and ERP-style workspace inspired by the attached layout.",
    shellWidth: "Enterprise",
    contentPadding: "Workspace",
    cardPadding: "ERP Card",
    tableDensity: "Enterprise",
    isDefault: false
  }
];

export function getDefaultLayout() {
  return layoutConfigs.find((layout) => layout.isDefault) ?? layoutConfigs[0];
}

export function applyLayout(layout: LayoutConfig | null) {
  if (typeof document === "undefined") {
    return;
  }
  const selectedLayout = layout ?? getDefaultLayout();
  const root = document.documentElement;
  root.dataset.layout = selectedLayout.id;
}

export function saveSessionLayout(layout: LayoutConfig) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(sessionLayoutKey, JSON.stringify(layout));
  applyLayout(layout);
}

export function getSessionLayout(): LayoutConfig | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(sessionLayoutKey);
  if (!raw) {
    return getDefaultLayout();
  }
  try {
    const parsed = JSON.parse(raw) as LayoutConfig;
    return layoutConfigs.find((layout) => layout.id === parsed.id) ?? getDefaultLayout();
  } catch {
    return getDefaultLayout();
  }
}

export function clearSessionLayout() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(sessionLayoutKey);
  applyLayout(getDefaultLayout());
}
