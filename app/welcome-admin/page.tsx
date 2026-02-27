"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  updatedAt?: string;
  // enriched after load
  _idea?: Idea;
}

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
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [evaluationComment, setEvaluationComment] = useState<Record<string, string>>({});
  const [evaluationDecision, setEvaluationDecision] = useState<Record<string, "ACCEPTED" | "REJECTED">>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [savingDraftId, setSavingDraftId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<ReviewDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Derive evaluator role and display name from current token
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

        if (payload?.role !== "EVALUATOR") {
          router.replace("/welcome");
          return;
        }

        const payloadUsername = payload?.username as string | undefined;
        const payloadEmail = payload?.email as string | undefined;
        const emailName = payloadEmail ? payloadEmail.split("@")[0] : null;
        const nameToUse = payloadUsername || emailName || payloadEmail || null;
        setDisplayName(nameToUse);

        if (typeof window !== "undefined") {
          try {
            if (payloadEmail) {
              window.localStorage.setItem("userEmail", payloadEmail);
            }
            const derivedUserName = payloadUsername || emailName || null;
            if (derivedUserName) {
              window.localStorage.setItem("userName", derivedUserName);
            } else {
              window.localStorage.removeItem("userName");
            }
          } catch {
            // ignore storage errors
          }
        }
      }
    } catch {
      router.replace("/login");
      return;
    }

    setAccessToken(token);
    void (async () => {
      const [fetchedIdeas, fetchedDrafts] = await Promise.all([
        fetchIdeas(token),
        fetchReviewDrafts(token),
      ]);
      applyLists(fetchedIdeas, fetchedDrafts);
    })();
  }, [router]);

  // Fetch helpers that return data without setting state
  const fetchIdeas = async (token: string): Promise<Idea[]> => {
    setLoadingIdeas(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/ideas", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(`Failed to load ideas (${res.status}). Please try again later.`);
        return [];
      }
      return ((await res.json()) as Idea[]) || [];
    } catch (err: any) {
      setError(err?.message ?? "Failed to load ideas");
      return [];
    } finally {
      setLoadingIdeas(false);
    }
  };

  const fetchReviewDrafts = async (token: string): Promise<ReviewDraft[]> => {
    setLoadingDrafts(true);
    try {
      const res = await fetch("http://localhost:3000/api/drafts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as ReviewDraft[];
      return (data || []).filter((d) => d.category === "review-draft");
    } catch {
      return [];
    } finally {
      setLoadingDrafts(false);
    }
  };

  // Apply both lists together: enrich drafts with idea data, filter queue
  const applyLists = (fetchedIdeas: Idea[], fetchedDrafts: ReviewDraft[]) => {
    setAllIdeas(fetchedIdeas);
    const draftedIdeaIds = new Set(fetchedDrafts.map((d) => d.dynamicFieldValues?.ideaId).filter(Boolean));
    setIdeas(fetchedIdeas.filter((i) => !draftedIdeaIds.has(i.id)));
    const enriched = fetchedDrafts.map((d) => ({
      ...d,
      _idea: fetchedIdeas.find((i) => i.id === d.dynamicFieldValues?.ideaId),
    }));
    setReviewDrafts(enriched);
  };

  const reloadAll = async () => {
    if (!accessToken) return;
    const [fetchedIdeas, fetchedDrafts] = await Promise.all([
      fetchIdeas(accessToken),
      fetchReviewDrafts(accessToken),
    ]);
    applyLists(fetchedIdeas, fetchedDrafts);
  };

  const handleEvaluate = async (ideaId: string) => {
    if (!accessToken) { router.replace("/login"); return; }
    const comment = evaluationComment[ideaId]?.trim();
    const decision = evaluationDecision[ideaId];
    if (!comment) {
      setError("Please enter a comment before submitting a decision.");
      return;
    }
    if (!decision) {
      setError("Please select Accept or Reject before submitting.");
      return;
    }
    setError(null);
    setSuccess(null);
    setEvaluatingId(ideaId);
    try {
      const res = await fetch("http://localhost:3000/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ideaId, decision, comments: comment }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || `Failed to submit evaluation (${res.status})`);
      }
      const result = (await res.json().catch(() => null)) as
        | { ideaId: string; evaluation: { id: string; comments: string; decision: string; createdAt?: string } }
        | null;
      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id !== ideaId) return idea;
          const existingEvaluations = idea.evaluations ?? [];
          const nextEvaluations =
            result && result.evaluation ? [...existingEvaluations, result.evaluation] : existingEvaluations;
          return { ...idea, status: decision, evaluations: nextEvaluations };
        })
      );
      setEvaluationComment((prev) => ({ ...prev, [ideaId]: "" }));
      setEvaluationDecision((prev) => { const next = { ...prev }; delete next[ideaId]; return next; });
      setSuccess(`Decision saved as ${decision.toLowerCase()}.`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit evaluation");
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleSaveReviewDraft = async (ideaId: string) => {
    if (!accessToken) { router.replace("/login"); return; }
    const comment = evaluationComment[ideaId]?.trim();
    const decision = evaluationDecision[ideaId];
    if (!comment) {
      setError("Please enter a comment before saving a draft.");
      return;
    }
    setError(null);
    setSuccess(null);
    setSavingDraftId(ideaId);
    try {
      // Check if a review draft for this idea already exists
      const existing = reviewDrafts.find(
        (d) => d.dynamicFieldValues?.ideaId === ideaId
      );
      const idea = ideas.find((i) => i.id === ideaId);

      if (existing) {
        // Update the existing draft
        const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(existing.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            title: existing.title,
            description: comment,
            category: "review-draft",
            dynamicFieldValues: { ideaId, decision: decision ?? existing.dynamicFieldValues?.decision ?? "", ideaTitle: idea?.title ?? "" },
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message || `Failed to update review draft (${res.status})`);
        }
      } else {
        // Create a new draft
        const res = await fetch("http://localhost:3000/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            title: `review-draft:${ideaId}`,
            description: comment,
            category: "review-draft",
            dynamicFieldValues: { ideaId, decision: decision ?? "", ideaTitle: idea?.title ?? "" },
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message || `Failed to save review draft (${res.status})`);
        }
      }

      // Reload everything — idea disappears from queue, appears in drafts
      await reloadAll();
      setSuccess("Review draft saved.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save review draft");
    } finally {
      setSavingDraftId(null);
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
                        <p style={{ margin: 0 }}>Decision recorded.</p>
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
                          <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                              <input
                                type="radio"
                                name={`decision-${idea.id}`}
                                value="ACCEPTED"
                                checked={evaluationDecision[idea.id] === "ACCEPTED"}
                                onChange={() =>
                                  setEvaluationDecision((prev) => ({ ...prev, [idea.id]: "ACCEPTED" }))
                                }
                              />
                              Accept
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                              <input
                                type="radio"
                                name={`decision-${idea.id}`}
                                value="REJECTED"
                                checked={evaluationDecision[idea.id] === "REJECTED"}
                                onChange={() =>
                                  setEvaluationDecision((prev) => ({ ...prev, [idea.id]: "REJECTED" }))
                                }
                              />
                              Reject
                            </label>
                          </div>
                          <div className="idea-form-actions" style={{ marginTop: "0.4rem" }}>
                            <button
                              type="button"
                              className="btn secondary"
                              disabled={savingDraftId === idea.id}
                              onClick={() => void handleSaveReviewDraft(idea.id)}
                            >
                              {savingDraftId === idea.id ? "Saving draft..." : "Save as draft"}
                            </button>
                            <button
                              type="button"
                              className="btn"
                              disabled={evaluatingId === idea.id}
                              onClick={() => void handleEvaluate(idea.id)}
                            >
                              {evaluatingId === idea.id ? "Saving..." : "Submit"}
                            </button>
                          </div>
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

      <section className="card" aria-labelledby="review-drafts-heading" style={{ marginTop: "1.5rem" }}>
        <h2 id="review-drafts-heading">My review drafts</h2>
        {loadingDrafts ? (
          <p>Loading review drafts…</p>
        ) : reviewDrafts.length === 0 ? (
          <p>No saved review drafts.</p>
        ) : (
          <div className="idea-table">
            <div className="idea-table-header idea-table-header--admin">
              <span>Title &amp; description</span>
              <span>Category</span>
              <span>Status</span>
              <span>Attachments</span>
              <span>Draft comment &amp; decision</span>
            </div>
            <ul className="idea-list">
              {reviewDrafts.map((rd) => {
                const idea = rd._idea;
                const decisionLabel =
                  rd.dynamicFieldValues?.decision === "ACCEPTED"
                    ? "Accept"
                    : rd.dynamicFieldValues?.decision === "REJECTED"
                    ? "Reject"
                    : "No decision yet";
                return (
                  <li key={rd.id} className="idea-item idea-item--admin">
                    <div>
                      <h3>{idea?.title ?? rd.dynamicFieldValues?.ideaTitle ?? "Unknown idea"}</h3>
                      <p>{idea?.description ?? "—"}</p>
                    </div>
                    <div>
                      <p>{idea?.category ?? "—"}</p>
                    </div>
                    <div>
                      <span>{renderStatus(idea?.status)}</span>
                    </div>
                    <div>
                      {idea?.attachments && idea.attachments.length > 0 ? (
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
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#374151" }}>
                        {rd.description?.slice(0, 150)}{rd.description && rd.description.length > 150 ? "…" : ""}
                      </p>
                      <small style={{ color: "#6b7280" }}>Decision: {decisionLabel}</small>
                      <div style={{ marginTop: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => router.push(`/welcome-admin/draft/${encodeURIComponent(rd.id)}`)}
                        >
                          Edit draft
                        </button>
                      </div>
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
