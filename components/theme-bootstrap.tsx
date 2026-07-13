"use client";

import { useEffect } from "react";

import { applyLayout, getSessionLayout } from "@/services/layout";
import { applyTheme, getSessionTheme } from "@/services/theme";

export function ThemeBootstrap() {
  useEffect(() => {
    const theme = getSessionTheme();
    if (theme) {
      applyTheme(theme);
    }
    applyLayout(getSessionLayout());
  }, []);

  return null;
}
