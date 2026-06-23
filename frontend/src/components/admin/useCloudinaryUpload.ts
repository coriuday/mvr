"use client";

import { useState, useCallback } from "react";
import { apiUrl } from "@/lib/api-url";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

export interface CloudinaryUploadState {
  uploading: boolean;
  progress: number; // 0–100
  error: string;
}

/** Map Cloudinary / sign-endpoint errors to actionable admin messages. */
export function formatCloudinaryUploadError(message: string, httpStatus?: number): string {
  const lower = message.toLowerCase();
  if (httpStatus === 503 || lower.includes("not configured")) {
    return "Image uploads are not configured on the server. Paste a URL instead, or ask admin to set CLOUDINARY_* env vars.";
  }
  if (lower.includes("upload preset") && lower.includes("not found")) {
    return "Cloudinary upload preset is misconfigured. Paste an image URL instead, or clear CLOUDINARY_UPLOAD_PRESET on the server.";
  }
  if (lower.includes("invalid signature") || lower.includes("signature")) {
    return "Upload signature rejected by Cloudinary. Check that API key and secret match your cloud name.";
  }
  return message;
}

export function useCloudinaryUpload(folder = "mvr/uploads") {
  const [state, setState] = useState<CloudinaryUploadState>({
    uploading: false,
    progress: 0,
    error: "",
  });

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        setState({
          uploading: false,
          progress: 0,
          error: "Image must be 10MB or smaller",
        });
        return null;
      }

      setState({ uploading: true, progress: 0, error: "" });

      try {
        // 1. Get signed upload parameters from our backend
        const signRes = await fetch(apiUrl("/api/admin/cloudinary/sign"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });

        if (!signRes.ok) {
          const err = await signRes.json().catch(() => ({}));
          const raw =
            err?.error?.message || `Failed to get upload signature (${signRes.status})`;
          throw new Error(formatCloudinaryUploadError(raw, signRes.status));
        }

        const signJson = await signRes.json();
        const data = signJson?.data;
        if (
          !data?.signature ||
          !data?.timestamp ||
          !data?.api_key ||
          !data?.cloud_name
        ) {
          throw new Error("Invalid upload signature response from server");
        }

        const { signature, timestamp, api_key, cloud_name } = data;

        setState((s) => ({ ...s, progress: 20 }));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", api_key);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        // Upload directly to Cloudinary with XHR to track progress
        const result = await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 70) + 20; // 20–90%
              setState((s) => ({ ...s, progress: pct }));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText) as UploadResult);
            } else {
              try {
                const body = JSON.parse(xhr.responseText);
                const raw = body?.error?.message || "Upload failed";
                reject(new Error(formatCloudinaryUploadError(raw)));
              } catch {
                reject(new Error(`Upload failed (${xhr.status})`));
              }
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`);
          xhr.send(formData);
        });

        setState({ uploading: false, progress: 100, error: "" });
        return result.secure_url;
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : "Upload failed";
        const msg = formatCloudinaryUploadError(raw);
        setState({ uploading: false, progress: 0, error: msg });
        return null;
      }
    },
    [folder]
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: "" });
  }, []);

  return { upload, reset, ...state };
}

export type { UploadResult };
