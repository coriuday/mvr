"use client";

import { useRef } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useCloudinaryUpload } from "./useCloudinaryUpload";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
}

/**
 * Multi-image gallery field — upload via Cloudinary, reorder, remove.
 */
export function AdminGalleryField({
  value,
  onChange,
  folder = "mvr/countries",
  label = "Gallery images",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useCloudinaryUpload(folder);

  const addUrl = (url: string) => {
    if (!url.trim()) return;
    onChange([...value, url.trim()]);
  };

  const handleFile = async (file: File) => {
    const url = await upload(file);
    if (url) addUrl(url);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= value.length) return;
    const copy = [...value];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a2f5e] hover:underline disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {uploading ? `Uploading ${progress}%` : "Add image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {value.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">
          <ImageIcon size={24} className="mx-auto mb-2 opacity-40" />
          No gallery images yet
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full aspect-video object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded bg-white/90 text-gray-700 disabled:opacity-40">
                    <ChevronUp size={12} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="p-1 rounded bg-white/90 text-gray-700 disabled:opacity-40">
                    <ChevronDown size={12} />
                  </button>
                </div>
                <button type="button" onClick={() => remove(i)} className="p-1 rounded bg-red-500 text-white">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
