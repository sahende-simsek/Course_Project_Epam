"use client";
import React from "react";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="card login-card">
        <h1 className="login-title">Welcome to InnovatEPAM Portal</h1>
        <p className="login-subtitle">
          Sign in to share, track and evaluate innovation ideas across EPAM.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
