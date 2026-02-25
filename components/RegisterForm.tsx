"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import AuthClient from "../lib/authClient";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      await AuthClient.register(email, password, username || undefined);
      setSuccess("Registration successful. You will be redirected to the sign-in page.");
      // after successful registration, navigate to login page with a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
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
        <label htmlFor="username">User name</label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
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
          autoComplete="new-password"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="auth-actions">
        <button type="submit" disabled={loading} aria-busy={loading} className="btn">
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>
      {success && (
        <div role="status" aria-live="polite" style={{ color: 'green', marginTop: '0.5rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div role="alert" aria-live="assertive" style={{color:'red'}}>
          {error}
        </div>
      )}
    </form>
  );
}
