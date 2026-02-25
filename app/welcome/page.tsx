"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status?: string;
  createdAt?: string;
  attachments?: {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  }[];
}

export default function WelcomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"] as const;

  const isAllowedFile = (file: File) => {
    const parts = file.name.split(".");
    if (parts.length < 2) return false;
    const ext = parts[parts.length - 1].toLowerCase();
    return allowedExtensions.includes(ext as (typeof allowedExtensions)[number]);
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

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
    const storedEmail = typeof window !== "undefined" ? window.localStorage.getItem("userEmail") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    setError(null);
    setSuccess(null);

    if (!title || !description || !category) {
      setError("Title, description and category are required.");
      return;
    }

    // Validate attachments (if any) before sending to backend.
    const invalidFiles = files.filter((f) => !isAllowedFile(f));
    if (invalidFiles.length > 0) {
      setError("Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed.");
      return;
    }

    setSubmitting(true);
    try {
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
        const msg = body?.error?.message || `Failed to create idea (${res.status})`;
        throw new Error(msg);
      }

      const created = (await res.json()) as Idea;

      // Optional: multiple attachments per idea (metadata only).
      let optimisticAttachments: Idea["attachments"] | undefined;
      if (files.length > 0) {
        try {
          await Promise.all(
            files.map((file) =>
              fetch("http://localhost:3000/api/ideas/attach", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  ideaId: created.id,
                  filename: file.name,
                  url: `/attachments/${encodeURIComponent(file.name)}`,
                  mimetype: file.type || "application/octet-stream",
                  size: file.size,
                }),
              })
            )
          );

          optimisticAttachments = files.map((file, index) => ({
            id: `${created.id}-attachment-${index}`,
            filename: file.name,
            url: `/attachments/${encodeURIComponent(file.name)}`,
            mimetype: file.type || "application/octet-stream",
            size: file.size,
          }));
        } catch {
          // attachment hatası ana akışı bozmasın
        }
      }

      // Optimistic update: backend'den liste çekilemese bile yeni fikri lokalde göster.
      setIdeas((prev) => [
        {
          ...created,
          attachments: optimisticAttachments ?? created.attachments,
        },
        ...prev,
      ]);

      setTitle("");
      setDescription("");
      setCategory("");
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccess("Idea submitted successfully.");
      // Backend listelemesi hata verse bile form başarılı kabul edilsin.
      await loadIdeas(accessToken);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create idea");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="welcome-page">
      <section className="welcome-header">
        <h1>Welcome{email ? `, ${email}` : ""}</h1>
        <p>From here you can submit a new idea and see your own ideas.</p>
      </section>

      <section className="card" aria-labelledby="idea-form-heading">
        <h2 id="idea-form-heading">Submit new idea</h2>
        <form onSubmit={handleSubmit} className="idea-form">
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
            <input
              id="category"
              name="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="idea-form-field">
            <label htmlFor="attachment">Attachment (single file)</label>
            <input
              id="attachment"
              name="attachment"
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </div>

          <div className="idea-form-actions">
            <button type="submit" disabled={submitting} className="btn">
              {submitting ? "Submitting..." : "Submit idea"}
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

      <section className="card" aria-labelledby="idea-list-heading">
        <h2 id="idea-list-heading">Your ideas</h2>
        {loadingIdeas ? (
          <p>Loading...</p>
        ) : ideas.length === 0 ? (
          <p>You do not have any ideas yet.</p>
        ) : (
          <ul>
            {ideas.map((idea) => (
              <li key={idea.id} className="idea-item">
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <p>
                  <strong>Category:</strong> {idea.category}
                </p>
                {idea.status && (
                  <p>
                    <strong>Status:</strong> {renderStatus(idea.status)}
                  </p>
                )}
                {idea.attachments && idea.attachments.length > 0 && (
                  <div style={{ marginTop: "0.25rem" }}>
                    <strong>Attachment:</strong>{" "}
                    {idea.attachments.map((att) => (
                      <span key={att.id}>
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          {att.filename}
                        </a>
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
