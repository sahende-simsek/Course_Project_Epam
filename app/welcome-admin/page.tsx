"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status?: string;
  attachments?: {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  }[];
  evaluations?: {
    id: string;
    comments: string;
    decision: string;
    createdAt?: string;
  }[];
}

export default function WelcomeAdminPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [evaluationComment, setEvaluationComment] = useState<Record<string, string>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Role guard: evaluator-only dashboard
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

    // Derive admin/evaluator display name from current token (username or email)
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        const payloadUsername = payload?.username as string | undefined;
        const payloadEmail = payload?.email as string | undefined;
        const nameToUse = payloadUsername || payloadEmail || null;
        setDisplayName(nameToUse);

        if (typeof window !== "undefined") {
          try {
            if (payloadEmail) {
              window.localStorage.setItem("userEmail", payloadEmail);
            }
            if (payloadUsername) {
              window.localStorage.setItem("userName", payloadUsername);
            } else {
              window.localStorage.removeItem("userName");
            }
          } catch {
            // ignore storage errors
          }
        }
      }
    } catch {
      // ignore decode errors
    }

    setAccessToken(token);
    void loadIdeas(token);
  }, [router]);

  const loadIdeas = async (token: string) => {
    setLoadingIdeas(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/ideas", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setError(`Failed to load ideas (${res.status}). Please try again later.`);
        return;
      }
      const data = (await res.json()) as Idea[];
      setIdeas(data || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load ideas");
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleEvaluate = async (ideaId: string, decision: "ACCEPTED" | "REJECTED") => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    const comment = evaluationComment[ideaId]?.trim();
    if (!comment) {
      setError("Please enter a comment before submitting a decision.");
      return;
    }

    setError(null);
    setSuccess(null);
    setEvaluatingId(ideaId);
    try {
      const res = await fetch("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ideaId, decision, comments: comment }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error?.message || `Failed to submit evaluation (${res.status})`;
        throw new Error(msg);
      }

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                status: decision,
              }
            : idea
        )
      );
      setEvaluationComment((prev) => ({ ...prev, [ideaId]: "" }));
      setSuccess(`Decision saved as ${decision.toLowerCase()}.`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit evaluation");
    } finally {
      setEvaluatingId(null);
    }
  };

  const renderStatus = (status?: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "UNDER_REVIEW":
        return "Under review";
      case "SUBMITTED":
      default:
        return "Submitted";
    }
  };

  return (
    <main className="welcome-page">
      <section className="welcome-header">
        <h1>Admin / Evaluator Dashboard{displayName ? `, ${displayName}` : ""}</h1>
        <p>You are signed in with evaluator privileges and can review ideas.</p>
      </section>

      <section className="card" aria-labelledby="idea-review-heading">
        <h2 id="idea-review-heading">Idea review queue</h2>
        {error && (
          <div role="alert" style={{ color: "red", marginBottom: "0.5rem" }}>
            {error}
          </div>
        )}
        {success && (
          <div role="status" style={{ color: "green", marginBottom: "0.5rem" }}>
            {success}
          </div>
        )}
        {loadingIdeas ? (
          <p>Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <p>There are no ideas to review yet.</p>
        ) : (
          <div className="idea-table">
            <div className="idea-table-header idea-table-header--admin">
              <span>Title & description</span>
              <span>Category</span>
              <span>Status</span>
              <span>Attachments</span>
              <span>Review & comment</span>
            </div>
            <ul className="idea-list">
              {ideas.map((idea) => {
                const latestComment =
                  idea.evaluations && idea.evaluations.length > 0
                    ? idea.evaluations[idea.evaluations.length - 1].comments
                    : null;

                const isFinal = idea.status === "ACCEPTED" || idea.status === "REJECTED";

                return (
                  <li key={idea.id} className="idea-item idea-item--admin">
                    <div>
                      <h3>{idea.title}</h3>
                      <p>{idea.description}</p>
                    </div>
                    <div>
                      <p>{idea.category}</p>
                    </div>
                    <div>
                      <span>{renderStatus(idea.status)}</span>
                    </div>
                    <div>
                      {idea.attachments && idea.attachments.length > 0 ? (
                        idea.attachments.map((att) => (
                          <div key={att.id}>
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              {att.filename}
                            </a>
                          </div>
                        ))
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    <div>
                      {isFinal ? (
                        <>
                          <p style={{ margin: 0 }}>Decision recorded.</p>
                          {latestComment && (
                            <p
                              style={{
                                margin: "0.25rem 0 0 0",
                                fontSize: "0.85rem",
                                color: "#6b7280",
                              }}
                            >
                              Admin comment: {latestComment}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="idea-form-field" style={{ marginTop: "0.15rem" }}>
                            <label htmlFor={`comment-${idea.id}`}>Evaluation comment</label>
                            <textarea
                              id={`comment-${idea.id}`}
                              value={evaluationComment[idea.id] ?? ""}
                              onChange={(e) =>
                                setEvaluationComment((prev) => ({
                                  ...prev,
                                  [idea.id]: e.target.value,
                                }))
                              }
                              rows={3}
                            />
                          </div>
                          <div className="idea-form-actions" style={{ marginTop: "0.25rem" }}>
                            <button
                              type="button"
                              className="btn"
                              disabled={evaluatingId === idea.id}
                              onClick={() => handleEvaluate(idea.id, "ACCEPTED")}
                            >
                              {evaluatingId === idea.id ? "Saving..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              className="btn secondary"
                              disabled={evaluatingId === idea.id}
                              onClick={() => handleEvaluate(idea.id, "REJECTED")}
                            >
                              {evaluatingId === idea.id ? "Saving..." : "Reject"}
                            </button>
                          </div>
                          {latestComment && (
                            <p
                              style={{
                                margin: "0.35rem 0 0 0",
                                fontSize: "0.85rem",
                                color: "#6b7280",
                              }}
                            >
                              Admin comment: {latestComment}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
