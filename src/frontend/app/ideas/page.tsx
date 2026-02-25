"use client";
import React, { useEffect, useState } from "react";

type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/api/ideas", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || body?.message || `Failed to load ideas (${res.status})`);
        }
        const data = (await res.json()) as Idea[];
        setIdeas(data);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load ideas");
      } finally {
        setLoading(false);
      }
    };

    void fetchIdeas();
  }, []);

  return (
    <main>
      <h1>Ideas</h1>
      {loading && <p>Loading ideas…</p>}
      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      {!loading && !error && ideas.length === 0 && <p>No ideas yet.</p>}
      <ul>
        {ideas.map((idea) => (
          <li key={idea.id}>
            <strong>{idea.title}</strong> – {idea.category} ({idea.status})
          </li>
        ))}
      </ul>
    </main>
  );
}
