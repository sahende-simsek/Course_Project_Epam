"use client";

import React, { useRef, useState } from "react";

export interface IdeaAttachment {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

interface Props {
  ideaId: string;
  accessToken: string;
  initialAttachments?: IdeaAttachment[];
  onChange?: (attachments: IdeaAttachment[]) => void;
}

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

function isAllowedFile(file: File) {
  const parts = file.name.split(".");
  if (parts.length < 2) return false;
  const ext = parts[parts.length - 1].toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export default function IdeaAttachmentsUploader({
  ideaId,
  accessToken,
  initialAttachments = [],
  onChange,
}: Props) {
  const [attachments, setAttachments] = useState<IdeaAttachment[]>(initialAttachments);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sync = (next: IdeaAttachment[]) => {
    setAttachments(next);
    onChange?.(next);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    const list = Array.from(files);
    const allowed = list.filter(isAllowedFile);
    if (allowed.length !== list.length) {
      setError(
        "Only document files (pdf, doc, docx, xls, xlsx, ppt, pptx) are allowed.",
      );
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const uploaded: IdeaAttachment[] = [];
      const contents = await Promise.all(
        allowed.map(
          (file) =>
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
              reader.onerror = () =>
                reject(reader.error || new Error("Failed to read file"));
              reader.readAsDataURL(file);
            }),
        ),
      );

      for (let i = 0; i < allowed.length; i++) {
        const file = allowed[i];
        const contentBase64 = contents[i];

        const res = await fetch(
          `http://localhost:3000/api/ideas/${encodeURIComponent(
            ideaId,
          )}/attachments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              filename: file.name,
              mimetype: file.type || "application/octet-stream",
              size: file.size,
              contentBase64,
            }),
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const msg =
            body?.error?.message ||
            body?.error ||
            `Failed to upload attachment (${res.status})`;
          throw new Error(msg);
        }

        const att = (await res.json()) as IdeaAttachment;
        uploaded.push(att);
      }

      const next = [...attachments, ...uploaded];
      sync(next);
    } catch (err: any) {
      setError(err?.message ?? "Failed to upload attachments");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (attachmentId: string) => {
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3000/api/ideas/${encodeURIComponent(
          ideaId,
        )}/attachments/${encodeURIComponent(attachmentId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (res.status !== 204) {
        const body = await res.json().catch(() => null);
        const msg =
          body?.error?.message ||
          body?.error ||
          `Failed to remove attachment (${res.status})`;
        throw new Error(msg);
      }

      const next = attachments.filter((a) => a.id !== attachmentId);
      sync(next);
    } catch (err: any) {
      setError(err?.message ?? "Failed to remove attachment");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.25rem",
        }}
      >
        <button
          type="button"
          className="btn secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload attachments"}
        </button>
        <span>
          {attachments.length > 0
            ? `${attachments.length} attachment(s)`
            : "No attachments yet"}
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => void handleFilesSelected(e.target.files)}
      />
      <small>
        Allowed file types: pdf, doc, docx, xls, xlsx, ppt, pptx. File size and
        count limits may apply.
      </small>
      {attachments.length > 0 && (
        <ul style={{ marginTop: "0.5rem" }}>
          {attachments.map((att) => (
            <li key={att.id}>
              <a href={att.url} target="_blank" rel="noopener noreferrer">
                {att.filename}
              </a>{" "}
              <button
                type="button"
                className="btn secondary"
                style={{ marginLeft: "0.5rem" }}
                onClick={() => void handleRemove(att.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div
          role="alert"
          style={{ color: "red", marginTop: "0.5rem", fontSize: "0.9rem" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

