"use client";

import { useEffect, useRef } from "react";

export function useEffectOnce(effect: () => void | (() => void)) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;
    return effect();
  }, [effect]);
}
