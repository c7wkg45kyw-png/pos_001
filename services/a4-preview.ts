export type A4PreviewLayout = {
  sellerFontSize: number;
  buyerFontSize: number;
  metaFontSize: number;
  metaPanelWidth: number;
  termsFontSize: number;
  tableWidth: number;
  headerGap: number;
  metaGap: number;
  termsTop: number;
};

const storageKey = "qms.a4PreviewLayout";

const defaultLayout: A4PreviewLayout = {
  sellerFontSize: 14,
  buyerFontSize: 14,
  metaFontSize: 13,
  metaPanelWidth: 280,
  termsFontSize: 12,
  tableWidth: 100,
  headerGap: 24,
  metaGap: 16,
  termsTop: 16
};

export function getA4PreviewLayout(): A4PreviewLayout {
  if (typeof window === "undefined") {
    return defaultLayout;
  }
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return defaultLayout;
  }
  try {
    return { ...defaultLayout, ...(JSON.parse(raw) as Partial<A4PreviewLayout>) };
  } catch {
    return defaultLayout;
  }
}

export function saveA4PreviewLayout(layout: A4PreviewLayout) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  }
}

export function defaultA4PreviewLayout(): A4PreviewLayout {
  return { ...defaultLayout };
}
