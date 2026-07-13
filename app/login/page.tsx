"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Sign in to continue.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!username || !password) {
      setMessage("Username and password are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(username, password);
      router.push("/pos-dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div className="brand login-brand">
          <div>
            <h1>POS001</h1>
            <p>POS Workspace</p>
          </div>
        </div>
        <div className="notice">{message}</div>
        <label className="field">
          <span>Username</span>
          <input name="username" autoComplete="username" placeholder="sales" autoFocus required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" placeholder="password" required />
        </label>
        <button className="button primary login-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
