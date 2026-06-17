"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Star, Search, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import api from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

interface Testimonial {
  id: string;
  student_name: string;
  review: string;
  image_url: string | null;
  rating: number;
  country: string | null;
  university: string | null;
  course: string | null;
  is_featured: boolean;
  created_at: string;
}

type Draft = Partial<Testimonial>;

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`transition-colors ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            size={16}
            className={star <= value ? "text-[#c9a84c] fill-[#c9a84c]" : "text-gray-200"}
          />
        </button>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-100" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-16 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/testimonials");
      setTestimonials(res.data.data ?? []);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.student_name?.trim() || !draft?.review?.trim()) {
      toast.error("Name and review are required");
      return;
    }
    if (!draft.rating || draft.rating < 1 || draft.rating > 5) {
      toast.error("Please select a rating (1–5 stars)");
      return;
    }
    setSaving(true);
    const payload = {
      student_name: draft.student_name,
      review: draft.review,
      image_url: draft.image_url || null,
      rating: draft.rating,
      country: draft.country || null,
      university: draft.university || null,
      course: draft.course || null,
      is_featured: draft.is_featured ?? false,
    };
    try {
      if (draft.id) {
        const res = await api.put(`/testimonials/${draft.id}`, payload);
        const updated: Testimonial = res.data.data ?? { ...draft, ...payload, id: draft.id, created_at: (draft as Testimonial).created_at };
        // Bug 2B: update in-place — no full list re-fetch needed
        setTestimonials((prev) => prev.map((t) => t.id === draft.id ? updated : t));
        toast.success("Testimonial updated");
      } else {
        const res = await api.post("/testimonials", payload);
        const created: Testimonial = res.data.data ?? { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() };
        // Bug 2B: prepend to list
        setTestimonials((prev) => [created, ...prev]);
        toast.success("Testimonial added");
      }
      setIsModalOpen(false);
      setDraft(null);
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/testimonials/${deleteTarget}`);
      toast.success("Testimonial deleted");
      // Bug 2B: filter out immediately — no full list re-fetch needed
      setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete testimonial");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = testimonials.filter(
    (t) =>
      t.student_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.university ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.country ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f5e]">Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">Student reviews and success stories.</p>
        </div>
        <Button
          className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white"
          onClick={() => { setDraft({ rating: 5, is_featured: false }); setIsModalOpen(true); }}
        >
          <Plus size={16} className="mr-2" /> Add Testimonial
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name, university or country…" value={searchRaw} onChange={(e) => setSearchRaw(e.target.value)} className="pl-9 h-9" />
        </div>
        <p className="text-sm text-gray-500 shrink-0">{filtered.length} of <strong>{testimonials.length}</strong></p>
      </div>

      {/* Card grid */}
      {loading ? (
        <CardSkeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{search ? "No testimonials match your search." : "No testimonials yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {t.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image_url} alt={t.student_name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#1a2f5e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.student_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#1a2f5e] text-sm">{t.student_name}</p>
                    {t.country && <p className="text-gray-400 text-xs">{t.country}</p>}
                  </div>
                </div>
                {t.is_featured && (
                  <span className="text-[9px] font-bold text-[#c9a84c] bg-amber-50 px-2 py-0.5 rounded-full shrink-0">FEATURED</span>
                )}
              </div>

              <StarRating value={t.rating} />

              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">&ldquo;{t.review}&rdquo;</p>

              {(t.university || t.course) && (
                <p className="text-xs text-gray-400">
                  {[t.course, t.university].filter(Boolean).join(" · ")}
                </p>
              )}

              <div className="flex items-center justify-end gap-1 pt-1 border-t border-gray-50">
                <button
                  onClick={() => { setDraft(t); setIsModalOpen(true); }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-[#1a2f5e] hover:bg-[#1a2f5e]/10 transition-colors"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(t.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { if (!saving) { setIsModalOpen(o); if (!o) setDraft(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a2f5e]">
              {draft?.id ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <CloudinaryImageUpload
              label="Student Photo (optional)"
              value={draft?.image_url || ""}
              onChange={(url) => setDraft({ ...draft, image_url: url })}
              folder="mvr/testimonials"
              aspectRatio="square"
            />

            <div className="space-y-1.5">
              <Label>Student Name *</Label>
              <Input value={draft?.student_name || ""} onChange={(e) => setDraft({ ...draft, student_name: e.target.value })} placeholder="e.g. Priya Sharma" required />
            </div>

            <div className="space-y-1.5">
              <Label>Rating *</Label>
              <StarRating value={draft?.rating ?? 5} onChange={(v) => setDraft({ ...draft, rating: v })} />
            </div>

            <div className="space-y-1.5">
              <Label>Review *</Label>
              <Textarea value={draft?.review || ""} onChange={(e) => setDraft({ ...draft, review: e.target.value })} placeholder="Student's testimonial in their own words…" rows={4} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={draft?.country || ""} onChange={(e) => setDraft({ ...draft, country: e.target.value })} placeholder="e.g. Canada" />
              </div>
              <div className="space-y-1.5">
                <Label>University</Label>
                <Input value={draft?.university || ""} onChange={(e) => setDraft({ ...draft, university: e.target.value })} placeholder="e.g. University of Toronto" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Course / Program</Label>
              <Input value={draft?.course || ""} onChange={(e) => setDraft({ ...draft, course: e.target.value })} placeholder="e.g. MSc Computer Science" />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={draft?.is_featured ?? false} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]" />
              <span className="text-sm font-medium text-gray-700">Feature on homepage</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" disabled={saving}>
                {saving ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</> : "Save Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Testimonial?"
        message="This will permanently remove the testimonial."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
