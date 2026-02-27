"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import IdeaAttachmentsUploader, {
  IdeaAttachment,
} from "../../../components/IdeaAttachmentsUploader";

interface IdeaDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  attachments?: IdeaAttachment[];
}

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ideaId) return;
    const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setAccessToken(token);
    void loadIdea(token, ideaId);
  }, [ideaId, router]);

  const loadIdea = async (token: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/ideas?id=${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || body?.error?.message || `Failed to load idea (${res.status})`;
        throw new Error(msg);
      }
      const data = (await res.json()) as IdeaDetail;
      setIdea(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load idea");
    } finally {
      setLoading(false);
    }
  };

  const canEditAttachments = !!accessToken && !!idea;

  return (
    <main className="welcome-page">
      <section className="card" aria-labelledby="idea-detail-heading">
        <div style={{ marginBottom: "0.75rem" }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => router.push("/ideas")}
          >
            Back to ideas
          </button>
        </div>
        <h1 id="idea-detail-heading">Idea detail</h1>
        {loading && <p>Loading idea…</p>}
        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}
        {idea && (
          <>
            <h2>{idea.title}</h2>
            <p>{idea.description}</p>
            <p>
              <strong>Category:</strong> {idea.category}
            </p>
            <p>
              <strong>Status:</strong> {idea.status}
            </p>

            <section style={{ marginTop: "1rem" }}>
              <h3>Attachments</h3>
              {accessToken ? (
                <IdeaAttachmentsUploader
                  ideaId={idea.id}
                  accessToken={accessToken}
                  initialAttachments={idea.attachments ?? []}
                  onChange={(next) => setIdea((prev) => (prev ? { ...prev, attachments: next } : prev))}
                />
              ) : (
                <>
                  {idea.attachments && idea.attachments.length > 0 ? (
                    <ul>
                      {idea.attachments.map((att) => (
                        <li key={att.id}>
                          <a href={att.url} target="_blank" rel="noopener noreferrer">
                            {att.filename}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No attachments.</p>
                  )}
                </>
              )}
            </section>
          </>
        )}
        {!loading && !error && !idea && <p>Idea not found.</p>}
      </section>
    </main>
  );
}

