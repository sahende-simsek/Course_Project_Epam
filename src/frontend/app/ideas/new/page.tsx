"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getIdeaFormConfig, type DynamicFieldConfig } from "../../../lib/ideaFormConfig";

export default function NewIdeaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string | number>>( {} );
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setAccessToken(token);

    const qpDraftId = searchParams.get("draftId");
    if (qpDraftId) {
      setDraftId(qpDraftId);
      void loadDraft(token, qpDraftId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  const loadDraft = async (token: string, id: string) => {
    setLoadingDraft(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/drafts?id=${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(`Failed to load draft (${res.status})`);
        return;
      }
      const draft = await res.json();
      setTitle(draft.title || "");
      setDescription(draft.description || "");
      setCategory(draft.category || "other");
      setDynamicValues(draft.dynamicFieldValues || {});
    } catch (err: any) {
      setError(err?.message ?? "Failed to load draft");
    } finally {
      setLoadingDraft(false);
    }
  };

  const fields = getIdeaFormConfig(category);

  const handleDynamicChange = (field: DynamicFieldConfig, value: string) => {
    setDynamicValues((prev) => ({ ...prev, [field.name]: field.type === "number" ? Number(value) : value }));
  };

  const handleSaveDraft = async () => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        title,
        description,
        category,
        dynamicFieldValues: dynamicValues,
      };
      const url = draftId
        ? `http://localhost:3000/api/drafts/${encodeURIComponent(draftId)}`
        : "http://localhost:3000/api/drafts";
      const method = draftId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error?.message || `Failed to save draft (${res.status})`;
        throw new Error(msg);
      }
      const saved = await res.json();
      setDraftId(saved.id);
      setSuccess("Draft saved.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitNow = async () => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // If we have a draft, submit it; otherwise submit directly as idea.
      if (draftId) {
        const res = await fetch("http://localhost:3000/api/drafts/" + encodeURIComponent(draftId) + "/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const msg = body?.error || body?.error?.message || `Failed to submit draft (${res.status})`;
          throw new Error(msg);
        }
      } else {
        const res = await fetch("http://localhost:3000/api/ideas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ title, description, category }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const msg = body?.error || body?.error?.message || `Failed to submit idea (${res.status})`;
          throw new Error(msg);
        }
      }

      setSuccess("Idea submitted successfully.");
      router.push("/welcome");
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit idea");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="welcome-page">
      <section className="card" aria-labelledby="new-idea-heading">
        <div style={{ marginBottom: "0.75rem" }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => router.push("/welcome")}
          >
            Back to home
          </button>
        </div>
        <h1 id="new-idea-heading">New Idea</h1>
        {loadingDraft && <p>Loading draft…</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmitNow();
          }}
          className="idea-form"
        >
          <div className="idea-form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="idea-form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="idea-form-field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="process-improvement">Process improvement</option>
              <option value="new-product">New product</option>
              <option value="other">Other</option>
            </select>
          </div>

          {fields
            .filter((f) => f.name !== "title" && f.name !== "description")
            .map((field) => (
              <div key={field.name} className="idea-form-field">
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={String(dynamicValues[field.name] ?? "")}
                    onChange={(e) => handleDynamicChange(field, e.target.value)}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type === "number" ? "number" : "text"}
                    required={field.required}
                    value={String(dynamicValues[field.name] ?? "")}
                    onChange={(e) => handleDynamicChange(field, e.target.value)}
                  />
                )}
              </div>
            ))}

          <div className="idea-form-actions" style={{ gap: "0.5rem", display: "flex" }}>
            <button
              type="button"
              className="btn secondary"
              disabled={saving}
              onClick={() => void handleSaveDraft()}
            >
              {saving ? "Saving draft…" : "Save draft"}
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit now"}
            </button>
          </div>
        </form>
        {error && (
          <div role="alert" style={{ color: "red", marginTop: "0.5rem" }}>
            {error}
          </div>
        )}
        {success && (
          <div role="status" style={{ color: "green", marginTop: "0.5rem" }}>
            {success}
          </div>
        )}
      </section>
    </main>
  );
}
