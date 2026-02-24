"use client";
import React, { useState } from "react";
import AuthClient from "../lib/authClient";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthClient.register(email, password);
    } catch (err: any) {
      setError(err?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} aria-label="register-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>
      {error && (
        <div role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </form>
  );
}
