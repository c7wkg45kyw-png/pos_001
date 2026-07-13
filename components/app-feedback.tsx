"use client";

import { useEffect, useRef, useState } from "react";

type ToastItem = {
  id: number;
  message: string;
};

function shouldIgnoreNotice(message: string) {
  const text = message.trim().toLowerCase();
  return (
    !text ||
    text.includes("loaded from backend") ||
    text.startsWith("loading ") ||
    text.startsWith("redirecting ")
  );
}

export function AppFeedback() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const seenTexts = useRef(new WeakMap<Element, string>());

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    function pushToast(message: string) {
      const id = nextId.current++;
      setItems((current) => [...current, { id, message }]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 4500);
    }

    function scanNotices() {
      const notices = document.querySelectorAll(".notice");
      notices.forEach((element) => {
        const nextText = element.textContent?.trim() ?? "";
        const previousText = seenTexts.current.get(element) ?? "";
        if (nextText === previousText) {
          return;
        }
        seenTexts.current.set(element, nextText);
        if (shouldIgnoreNotice(nextText)) {
          return;
        }
        pushToast(nextText);
      });
    }

    scanNotices();
    const observer = new MutationObserver(() => {
      scanNotices();
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="assertive" aria-atomic="true">
      {items.map((item) => (
        <div className="toast-popup" key={item.id} role="alert">
          <div className="toast-popup-title">Message</div>
          <div>{item.message}</div>
        </div>
      ))}
    </div>
  );
}
