"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("accessToken");
    setHasAccessToken(!!token);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;

      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
    } catch {
      // ignore client-side errors, still clear local state
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("userEmail");
      }
      router.push("/");
    }
  };

  const isWelcomeLike =
    pathname === "/welcome" ||
    pathname?.startsWith("/welcome/") ||
    pathname === "/welcome-admin" ||
    pathname?.startsWith("/welcome-admin/");

  return (
    <header className="site-header">
      <div className="inner">
        <div className="brand">InnovatEPAM Portal</div>
        <nav className="nav">
          {isWelcomeLike && hasAccessToken ? (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <a href="/">Home</a>
              <a href="/register">Register</a>
              <a href="/login">Login</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
