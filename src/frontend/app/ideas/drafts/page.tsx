"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Draft {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt?: string;
  attachments?: {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  }[];
}

export default function DraftsPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setAccessToken(token);
    void loadDrafts(token);
  }, [router]);

  const loadDrafts = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/drafts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(`Failed to load drafts (${res.status})`);
        return;
      }
      const data = (await res.json()) as Draft[];
      setDrafts(data || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(id)}` , {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || body?.error?.message || `Failed to delete draft (${res.status})`;
        throw new Error(msg);
      }
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete draft");
    }
  };

  const handleSubmit = async (id: string) => {
    if (!accessToken) return;
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(id)}/submit`, {
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
      // After submit, refresh list and redirect to welcome for simplicity
      await loadDrafts(accessToken);
      router.push("/welcome");
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit draft");
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!accessToken) return;
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/drafts/attachments/${encodeURIComponent(attachmentId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || body?.error?.message || `Failed to delete attachment (${res.status})`;
        throw new Error(msg);
      }
      setDrafts((prev) =>
        prev.map((d) =>
          !d.attachments
            ? d
            : { ...d, attachments: d.attachments.filter((a) => a.id !== attachmentId) }
        )
      );
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete attachment");
    }
  };

  const handleAddAttachment = async (draftId: string, files: File[]) => {
    if (!accessToken) return;
    setError(null);

    try {
      const newAttachments: any[] = [];

      for (const file of files) {
        const contents = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              const base64 = result.includes(",") ? result.split(",")[1] : result;
              resolve(base64);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });

        const res = await fetch("http://localhost:3000/api/drafts/attach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            draftId,
            filename: file.name,
            mimetype: file.type || "application/octet-stream",
            size: file.size,
            contentBase64: contents,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const msg = body?.error || body?.error?.message || `Failed to add attachment (${res.status})`;
          throw new Error(msg);
        }

        const newAttachment = await res.json();
        newAttachments.push(newAttachment);
      }

      setDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? { ...d, attachments: [...(d.attachments || []), ...newAttachments] }
            : d
        )
      );
    } catch (err: any) {
      setError(err?.message ?? "Failed to add attachment");
    }
  };

  return (
    <main className="welcome-page">
      <section className="card" aria-labelledby="drafts-heading">
        <div style={{ marginBottom: "0.75rem" }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => router.push("/welcome")}
          >
            Back to home
          </button>
        </div>
        <h1 id="drafts-heading">My Drafts</h1>
        {loading && <p>Loading drafts…</p>}
        {error && (
          <div role="alert" style={{ color: "red", marginTop: "0.5rem" }}>
            {error}
          </div>
        )}
        {!loading && drafts.length === 0 && !error && <p>You have no drafts yet.</p>}
        {!loading && drafts.length > 0 && (
          <ul className="idea-list">
            {drafts.map((draft) => (
              <li key={draft.id} className="idea-item">
                <div>
                  <h3>{draft.title}</h3>
                  <p>{draft.description}</p>
                  <small>{draft.category}</small>
                  <div style={{ marginTop: "0.5rem" }}>
                    <strong>Attachments:</strong>
                    {draft.attachments && draft.attachments.length > 0 ? (
                      <ul>
                        {draft.attachments.map((att) => (
                          <li key={att.id}>
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              {att.filename}
                            </a>{" "}
                            <button
                              type="button"
                              className="btn secondary"
                              style={{ marginLeft: "0.5rem" }}
                              onClick={() => void handleRemoveAttachment(att.id)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ marginTop: "0.25rem" }}>No attachments.</p>
                    )}
                    <div style={{ marginTop: "0.5rem" }}>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          if (files.length > 0) {
                            void handleAddAttachment(draft.id, files);
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="btn" onClick={() => handleSubmit(draft.id)}>
                    Submit
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => handleDelete(draft.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
