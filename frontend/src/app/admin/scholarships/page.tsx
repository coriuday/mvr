"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Award, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import api from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

type ScholarshipType = "MERIT_BASED" | "NEED_BASED" | "GOVERNMENT" | "UNIVERSITY" | "PRIVATE";

interface Scholarship {
  id: string;
  name: string;
  scholarship_type: ScholarshipType;
  country: string;
  amount: string | null;
  deadline: string | null;
  description: string | null;
  eligibility: string | null;
  apply_url: string | null;
  is_featured: boolean;
  created_at: string;
}

type Draft = Partial<Scholarship>;

const TYPE_LABELS: Record<ScholarshipType, string> = {
  MERIT_BASED: "Merit Based",
  NEED_BASED:  "Need Based",
  GOVERNMENT:  "Government",
  UNIVERSITY:  "University",
  PRIVATE:     "Private",
};

const TYPE_COLORS: Record<ScholarshipType, string> = {
  MERIT_BASED: "bg-blue-50 text-blue-700",
  NEED_BASED:  "bg-purple-50 text-purple-700",
  GOVERNMENT:  "bg-emerald-50 text-emerald-700",
  UNIVERSITY:  "bg-[#1a2f5e]/10 text-[#1a2f5e]",
  PRIVATE:     "bg-amber-50 text-[#c9a84c]",
};

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-24" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/scholarships");
      setScholarships(res.data.data ?? []);
    } catch {
      toast.error("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.name?.trim() || !draft?.country?.trim() || !draft?.scholarship_type) {
      toast.error("Name, country and type are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: draft.name,
      scholarship_type: draft.scholarship_type,
      country: draft.country,
      amount: draft.amount || null,
      deadline: draft.deadline || null,
      description: draft.description || null,
      eligibility: draft.eligibility || null,
      apply_url: draft.apply_url || null,
      is_featured: draft.is_featured ?? false,
    };
    try {
      if (draft.id) {
        const res = await api.put(`/scholarships/${draft.id}`, payload);
        const updated: Scholarship = res.data.data ?? { ...draft, ...payload, id: draft.id, created_at: (draft as Scholarship).created_at };
        // Bug 2B: update in-place — no full list re-fetch needed
        setScholarships((prev) => prev.map((s) => s.id === draft.id ? updated : s));
        toast.success("Scholarship updated");
      } else {
        const res = await api.post("/scholarships", payload);
        const created: Scholarship = res.data.data ?? { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() };
        // Bug 2B: prepend to list
        setScholarships((prev) => [created, ...prev]);
        toast.success("Scholarship created");
      }
      setIsModalOpen(false);
      setDraft(null);
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to save scholarship");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/scholarships/${deleteTarget}`);
      toast.success("Scholarship deleted");
      // Bug 2B: filter out immediately — no full list re-fetch needed
      setScholarships((prev) => prev.filter((s) => s.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete scholarship");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = scholarships.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f5e]">Scholarships</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage scholarship listings for students.</p>
        </div>
        <Button
          className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white"
          onClick={() => { setDraft({ scholarship_type: "MERIT_BASED", is_featured: false }); setIsModalOpen(true); }}
        >
          <Plus size={16} className="mr-2" /> Add Scholarship
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name or country…" value={searchRaw} onChange={(e) => setSearchRaw(e.target.value)} className="pl-9 h-9" />
        </div>
        <p className="text-sm text-gray-500 shrink-0">{filtered.length} of <strong>{scholarships.length}</strong></p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Scholarship</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><TableSkeleton /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    {search ? "No scholarships match your search." : "No scholarships added yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1a2f5e]/8 flex items-center justify-center shrink-0">
                          <Award size={15} className="text-[#1a2f5e]/50" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a2f5e]">{s.name}</p>
                          <p className="text-gray-400 text-xs">{s.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[s.scholarship_type]}`}>
                        {TYPE_LABELS[s.scholarship_type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm font-medium">{s.amount ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {s.deadline ? new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.apply_url && (
                          <a href={s.apply_url} target="_blank" rel="noreferrer"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <button onClick={() => { setDraft(s); setIsModalOpen(true); }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#1a2f5e] hover:bg-[#1a2f5e]/10 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(s.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { if (!saving) { setIsModalOpen(o); if (!o) setDraft(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a2f5e]">
              {draft?.id ? "Edit Scholarship" : "Add Scholarship"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={draft?.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Chevening Scholarship" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Country *</Label>
                <Input value={draft?.country || ""} onChange={(e) => setDraft({ ...draft, country: e.target.value })} placeholder="e.g. United Kingdom" required />
              </div>
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <select
                  value={draft?.scholarship_type || "MERIT_BASED"}
                  onChange={(e) => setDraft({ ...draft, scholarship_type: e.target.value as ScholarshipType })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/20"
                  required
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount / Value</Label>
                <Input value={draft?.amount || ""} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} placeholder="e.g. Full Tuition or £18,000" />
              </div>
              <div className="space-y-1.5">
                <Label>Application Deadline</Label>
                <Input type="date" value={draft?.deadline ? draft.deadline.split("T")[0] : ""} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={draft?.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What is this scholarship about?" rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>Eligibility Criteria</Label>
              <Textarea value={draft?.eligibility || ""} onChange={(e) => setDraft({ ...draft, eligibility: e.target.value })} placeholder="Who can apply? Academic requirements, nationality, etc." rows={2} />
            </div>

            <div className="space-y-1.5">
              <Label>Application Link</Label>
              <Input value={draft?.apply_url || ""} onChange={(e) => setDraft({ ...draft, apply_url: e.target.value })} placeholder="https://..." />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={draft?.is_featured ?? false} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]" />
              <span className="text-sm font-medium text-gray-700">Feature on homepage</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" disabled={saving}>
                {saving ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</> : "Save Scholarship"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Scholarship?"
        message="This will permanently remove the scholarship listing."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
