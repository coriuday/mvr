"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { FileText, Plus } from "lucide-react";

export default function AdminBlogsPage() {
  const { token } = useAdminAuth();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <div className="w-16 h-16 bg-[#1a2f5e]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FileText size={28} className="text-[#1a2f5e]" />
      </div>
      <h2 className="text-xl font-bold text-[#1a2f5e] mb-2">Blog Management</h2>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
        Write and publish student success stories, visa guides, and study abroad tips.
        Full rich-text editor coming soon.
      </p>
      <p className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full border border-amber-200">
        <Plus size={12} /> Coming in Phase 4 — DB connection required
      </p>
    </div>
  );
}
