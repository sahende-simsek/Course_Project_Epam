"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import AuthClient from "../lib/authClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await AuthClient.login(email, password);

      // basit client-side oturum saklama: token ve email'i localStorage'a yaz
      if (typeof window !== 'undefined') {
        try {
          const access = (session as any)?.accessToken;
          // login adapter returns accessToken as a plain JWT string
          if (typeof access === 'string') {
            window.localStorage.setItem('accessToken', access);
          } else if (access && typeof access.token === 'string') {
            // fallback for older shape { token, expiresIn }
            window.localStorage.setItem('accessToken', access.token);
          }
          window.localStorage.setItem('userEmail', email);
        } catch {
          // localStorage hataları oturumu bozmasın
        }
      }
      // JWT payload icindeki role alanina gore sayfa sec
      let role: string | undefined;
      try {
        const access = (session as any)?.accessToken;
        const raw = typeof access === 'string' ? access : access?.token;
        if (typeof raw === 'string') {
          const parts = raw.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            role = payload?.role;
          }
        }
      } catch {
        // decode hatasi olursa role bos kalir
      }

      if (role === 'EVALUATOR') {
        router.push('/welcome-admin');
      } else {
        router.push('/welcome');
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  return (
    <form onSubmit={onSubmit} aria-label="login-form" className="card auth-card">
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
        {loading ? "Signing in..." : "Sign in"}
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
