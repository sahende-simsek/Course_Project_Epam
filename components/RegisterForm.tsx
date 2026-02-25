"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
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
      console.log('RegisterForm: submitting', { email });
      await AuthClient.register(email, password);
      console.log('RegisterForm: register success, about to navigate to /login');
      // after successful registration, navigate to login page
      router.push('/login');
      console.log('RegisterForm: router.push called to /login');
    } catch (err: any) {
      setError(err?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  return (
    <form onSubmit={onSubmit} aria-label="register-form" className="card auth-card">
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
      <div className="auth-actions">
        <button type="submit" disabled={loading} aria-busy={loading} className="btn">
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>
      {error && (
        <div role="alert" aria-live="assertive" style={{color:'red'}}>
          {error}
        </div>
      )}
    </form>
  );
}
