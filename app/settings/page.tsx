"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/theme");
  }, [router]);

  return <div className="main"><div className="notice">Loading settings...</div></div>;
}
