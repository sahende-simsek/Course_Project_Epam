"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // basit client-side guard: token yoksa login'e gonder
    const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
    const storedEmail = typeof window !== "undefined" ? window.localStorage.getItem("userEmail") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Welcome{email ? `, ${email}` : ""}</h1>
        <p>This is your personal dashboard placeholder. You are signed in.</p>
      </div>
    </main>
  );
}
