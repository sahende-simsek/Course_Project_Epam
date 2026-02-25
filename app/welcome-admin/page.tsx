"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");
    const storedEmail = window.localStorage.getItem("userEmail");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Role guard: admin sayfasi yalnizca EVALUATOR rolune acik
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload?.role !== "EVALUATOR") {
          router.replace("/welcome");
          return;
        }
      }
    } catch {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Admin / Evaluator Dashboard{email ? `, ${email}` : ""}</h1>
        <p>You are signed in with evaluator privileges.</p>
      </div>
    </main>
  );
}
