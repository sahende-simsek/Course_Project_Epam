"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
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
  evaluations?: {
    id: string;
    comments: string;
    decision: string;
    createdAt?: string;
  }[];
}

export default function WelcomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
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

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
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

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];

    if (selected.length === 0) {
      setFiles([]);
      return;
    }

    // Enforce single-file policy on the client side
    let nextFiles = selected.slice(0, 1);
    if (selected.length > 1) {
      setError("At most one file can be uploaded.");
    } else {
      setError(null);
    }

    const allowed = nextFiles.filter((file) => isAllowedFile(file));

    if (allowed.length !== nextFiles.length) {
      setError("Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed.");
    }

    setFiles(allowed);

    if (fileInputRef.current) {
      const dt = new DataTransfer();
      allowed.forEach((file) => dt.items.add(file));
      fileInputRef.current.files = dt.files;
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
        return "Submitted (under review)";
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    // Always derive the name from the current token (DB-backed),
    // falling back to email if username is not present.
    let nameToUse: string | null = null;
    let emailFromToken: string | null = null;
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        const payloadUsername = payload?.username as string | undefined;
        const payloadEmail = payload?.email as string | undefined;
        nameToUse = payloadUsername || payloadEmail || null;
        emailFromToken = payloadEmail || null;

        if (typeof window !== "undefined") {
          try {
            if (emailFromToken) {
              window.localStorage.setItem("userEmail", emailFromToken);
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
      // ignore decode errors; nameToUse stays null
    }

    setDisplayName(nameToUse);
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

    const finalCategory = category === "__OTHER__" ? otherCategory.trim() : category;

    if (!title || !description || !finalCategory) {
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
        body: JSON.stringify({ title, description, category: finalCategory }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error?.message || `Failed to create idea (${res.status})`;
        throw new Error(msg);
      }

      const created = (await res.json()) as Idea;

      if (files.length > 0) {
        try {
          const contents = await Promise.all(files.map((file) => readFileAsBase64(file)));
          await Promise.all(
            files.map((file, index) =>
              fetch("http://localhost:3000/api/ideas/attach", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  ideaId: created.id,
                  filename: file.name,
                  mimetype: file.type || "application/octet-stream",
                  size: file.size,
                  contentBase64: contents[index],
                }),
              })
            )
          );
        } catch {
          // Attachment errors should not block main idea submission.
        }
      }

      // Optimistic update for idea itself; attachments will be refreshed from backend.
      setIdeas((prev) => [created, ...prev]);

      setTitle("");
      setDescription("");
      setCategory("");
      setOtherCategory("");
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
        <h1>Welcome{displayName ? `, ${displayName}` : ""}</h1>
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
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Process improvement">Process improvement</option>
              <option value="New product">New product</option>
              <option value="Customer experience">Customer experience</option>
              <option value="Internal tools">Internal tools</option>
              <option value="Cost optimization">Cost optimization</option>
              <option value="__OTHER__">Other</option>
            </select>
            {category === "__OTHER__" && (
              <input
                id="otherCategory"
                name="otherCategory"
                type="text"
                placeholder="Enter your category"
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                required
              />
            )}
            <small>You can choose a category from the list or select Other and type your own.</small>
          </div>

          <div className="idea-form-field">
            <label htmlFor="attachment">Attachment (you can select one file)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <button
                type="button"
                className="btn secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose files
              </button>
              <span>{files.length > 0 ? `${files.length} file(s) selected` : "No files selected"}</span>
            </div>
            <input
              id="attachment"
              name="attachment"
              type="file"
              ref={fileInputRef}
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />
            <small>
              Allowed file types: pdf, doc, docx, xls, xlsx, ppt, pptx.
            </small>
            {files.length > 0 && (
              <ul style={{ marginTop: "0.5rem" }}>
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    {file.name}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => {
                          const next = [...prev];
                          next.splice(index, 1);

                          // Dosya input'unu da güncel listeyle senkronize et
                          if (fileInputRef.current) {
                            const dt = new DataTransfer();
                            next.forEach((f) => dt.items.add(f));
                            fileInputRef.current.files = dt.files;
                          }

                          return next;
                        });
                      }}
                      style={{ marginLeft: "0.5rem" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
          <div className="idea-table">
            <div className="idea-table-header">
              <span>Title & description</span>
              <span>Category</span>
              <span>Status</span>
              <span>Admin comment</span>
              <span>Attachments</span>
            </div>
            <ul className="idea-list">
              {ideas.map((idea) => (
                <li key={idea.id} className="idea-item">
                  <div>
                    <h3>{idea.title}</h3>
                    <p>{idea.description}</p>
                  </div>
                  <div>
                    <p>{idea.category}</p>
                  </div>
                  <div>
                    {idea.status && <span>{renderStatus(idea.status)}</span>}
                  </div>
                  <div>
                    {idea.evaluations && idea.evaluations.length > 0 ? (
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                        Admin comment: {idea.evaluations[idea.evaluations.length - 1].comments}
                      </p>
                    ) : (
                      <span>-</span>
                    )}
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
