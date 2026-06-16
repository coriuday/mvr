"use client";

import { useRef, useState } from "react";
import { Upload, X, Link2, Image as ImageIcon, Loader2 } from "lucide-react";
import { useCloudinaryUpload } from "./useCloudinaryUpload";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: "video" | "square" | "logo";
}

/**
 * CloudinaryImageUpload
 *
 * Drop-in image field with:
 *  - File picker → upload via signed Cloudinary API
 *  - Live upload progress bar
 *  - Preview of existing or just-uploaded image
 *  - "Or paste a URL" fallback toggle
 */
export function CloudinaryImageUpload({
  value,
  onChange,
  folder = "mvr/uploads",
  label = "Image",
  aspectRatio = "video",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [preview, setPreview] = useState<string>("");
  const { upload, uploading, progress, error, reset } = useCloudinaryUpload(folder);

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "logo"
      ? "aspect-[3/1]"
      : "aspect-video";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    reset();

    const url = await upload(file);
    if (url) {
      onChange(url);
      setPreview("");
    }
    // Reset file input so the same file can be picked again
    e.target.value = "";
  }

  const displayUrl = preview || value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setMode(mode === "upload" ? "url" : "upload")}
          className="flex items-center gap-1 text-xs text-[#1a2f5e] hover:text-[#c9a84c] transition-colors"
        >
          {mode === "upload" ? (
            <>
              <Link2 size={11} /> Paste URL instead
            </>
          ) : (
            <>
              <Upload size={11} /> Upload file instead
            </>
          )}
        </button>
      </div>

      {mode === "url" ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20"
        />
      ) : (
        <div
          className={`relative w-full ${aspectClass} border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:border-[#c9a84c]/50 transition-colors group`}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {displayUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  Click to replace
                </span>
              </div>
              {!uploading && value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange("");
                    setPreview("");
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
                >
                  <X size={12} />
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
              <ImageIcon size={28} className="text-gray-300" />
              <p className="text-xs font-medium">Click to upload</p>
              <p className="text-[10px]">PNG, JPG, WebP up to 10MB</p>
            </div>
          )}

          {/* Progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="text-white animate-spin" />
              <div className="w-2/3 bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#c9a84c] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white text-xs">{progress}%</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={11} /> {error}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
