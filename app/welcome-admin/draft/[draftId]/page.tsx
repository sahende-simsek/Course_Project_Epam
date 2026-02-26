"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ReviewDraft {
  id: string;
  title: string;
  description: string;
  category: string;
  dynamicFieldValues?: {
    ideaId?: string;
    decision?: string;
    ideaTitle?: string;
  };
}

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  attachments?: {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  }[];
}

export default function AdminReviewDraftPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params?.draftId as string;

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<"ACCEPTED" | "REJECTED" | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("accessToken");
    if (!token) { router.replace("/login"); return; }

    // Role guard
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload?.role !== "EVALUATOR") { router.replace("/welcome"); return; }
      }
    } catch { router.replace("/login"); return; }

    setAccessToken(token);
    void loadDraft(token);
  }, [router, draftId]);

  const loadDraft = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/drafts?id=${encodeURIComponent(draftId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError("Failed to load draft.");
        return;
      }
      const data = (await res.json()) as ReviewDraft;
      setDraft(data);
      setComment(data.description ?? "");
      const storedDecision = data.dynamicFieldValues?.decision;
      if (storedDecision === "ACCEPTED" || storedDecision === "REJECTED") {
        setDecision(storedDecision);
      }

      // Load the idea
      const ideaId = data.dynamicFieldValues?.ideaId;
      if (ideaId) {
        try {
          const ideaRes = await fetch(`http://localhost:3000/api/ideas/${encodeURIComponent(ideaId)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (ideaRes.ok) {
            const ideaData = (await ideaRes.json()) as Idea;
            setIdea(ideaData);
          }
        } catch {
          // idea load failure is non-fatal
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!accessToken || !draft) return;
    const trimmedComment = comment.trim();
    if (!trimmedComment) { setError("Comment is required."); return; }
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(draftId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          title: draft.title,
          description: trimmedComment,
          category: "review-draft",
          dynamicFieldValues: {
            ideaId: draft.dynamicFieldValues?.ideaId ?? "",
            decision: decision,
            ideaTitle: draft.dynamicFieldValues?.ideaTitle ?? idea?.title ?? "",
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || `Failed to save draft (${res.status})`);
      }
      setSuccess("Draft saved.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken || !draft) return;
    const trimmedComment = comment.trim();
    if (!trimmedComment) { setError("Comment is required."); return; }
    if (!decision) { setError("Please select Accept or Reject before submitting."); return; }
    const ideaId = draft.dynamicFieldValues?.ideaId;
    if (!ideaId) { setError("Cannot submit: idea reference is missing from this draft."); return; }
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      // Submit the evaluation
      const evalRes = await fetch("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ideaId, decision, comments: trimmedComment }),
      });
      if (!evalRes.ok) {
        const body = await evalRes.json().catch(() => null);
        throw new Error(body?.error?.message || `Failed to submit evaluation (${evalRes.status})`);
      }

      // Delete the review draft
      await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(draftId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Navigate back — welcome-admin will reload ideas reflecting the new status
      router.push("/welcome-admin");
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit evaluation");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="welcome-page">
        <section className="card"><p>Loading…</p></section>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="welcome-page">
        <section className="card">
          <p style={{ color: "red" }}>{error ?? "Draft not found."}</p>
          <button type="button" className="btn secondary" onClick={() => router.push("/welcome-admin")}>
            Back
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="welcome-page">
      <section className="card">
        <div style={{ marginBottom: "0.75rem" }}>
          <button type="button" className="btn secondary" onClick={() => router.push("/welcome-admin")}>
            ← Back to dashboard
          </button>
        </div>
        <h1>Edit review draft</h1>

        {/* Idea summary */}
        <div style={{ background: "#f3f4f6", borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem" }}>
          <strong>Idea being reviewed:</strong>
          {idea ? (
            <div style={{ marginTop: "0.25rem" }}>
              <span style={{ fontWeight: 600 }}>{idea.title}</span>
              <span style={{ marginLeft: "0.5rem", color: "#6b7280", fontSize: "0.85rem" }}>
                ({idea.category})
              </span>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>{idea.description}</p>
              {idea.attachments && idea.attachments.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <strong style={{ fontSize: "0.85rem" }}>Attachments:</strong>
                  <ul style={{ margin: "0.25rem 0 0 1rem", padding: 0 }}>
                    {idea.attachments.map((att) => (
                      <li key={att.id}>
                        <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem" }}>
                          {att.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280" }}>
              {draft.dynamicFieldValues?.ideaTitle || draft.dynamicFieldValues?.ideaId || "Unknown idea"}
            </p>
          )}
        </div>

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

        {/* Comment */}
        <div className="idea-form-field">
          <label htmlFor="review-comment">Evaluation comment</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            style={{ width: "100%" }}
          />
        </div>

        {/* Decision radio */}
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="admin-decision"
              value="ACCEPTED"
              checked={decision === "ACCEPTED"}
              onChange={() => setDecision("ACCEPTED")}
            />
            Accept
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="admin-decision"
              value="REJECTED"
              checked={decision === "REJECTED"}
              onChange={() => setDecision("REJECTED")}
            />
            Reject
          </label>
        </div>

        {/* Actions */}
        <div className="idea-form-actions" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="btn secondary"
            disabled={saving}
            onClick={() => void handleSaveDraft()}
          >
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </section>
    </main>
  );
}
