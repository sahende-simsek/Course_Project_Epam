"use client";
import React from "react";
import RegisterForm from "../../components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="login-page">
      <section className="card login-card">
        <h1 className="login-title">Create your InnovatEPAM account</h1>
        <p className="login-subtitle">
          Register as an innovator to start submitting and tracking your ideas.
        </p>
        <RegisterForm />
      </section>
    </main>
  );
}
