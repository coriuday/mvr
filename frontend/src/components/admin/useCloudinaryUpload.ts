"use client";

import { useState, useRef, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

export interface CloudinaryUploadState {
  uploading: boolean;
  progress: number; // 0–100
  error: string;
}

export function useCloudinaryUpload(folder = "mvr/uploads") {
  const [state, setState] = useState<CloudinaryUploadState>({
    uploading: false,
    progress: 0,
    error: "",
  });

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setState({ uploading: true, progress: 0, error: "" });

      try {
        // 1. Get signed upload parameters from our backend
        const signRes = await fetch(`${API}/api/admin/cloudinary/sign`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });

        if (!signRes.ok) {
          const err = await signRes.json().catch(() => ({}));
          throw new Error(
            err?.error?.message || "Failed to get upload signature"
          );
        }

        const {
          data: { signature, timestamp, api_key, cloud_name, upload_preset },
        } = await signRes.json();

        setState((s) => ({ ...s, progress: 20 }));

        // 2. Build multipart form for Cloudinary direct upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", api_key);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);
        if (upload_preset) formData.append("upload_preset", upload_preset);

        // 3. Upload directly to Cloudinary with XHR to track progress
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
                reject(new Error(body?.error?.message || "Upload failed"));
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
        const msg = err instanceof Error ? err.message : "Upload failed";
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
