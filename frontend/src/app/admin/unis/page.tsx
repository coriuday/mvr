"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, MapPin, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import api from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

interface University {
  id: string;
  name: string;
  country: string;
  ranking: number | null;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  is_featured: boolean;
  created_at: string;
}

type UniDraft = Partial<University>;

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
          <div className="h-6 bg-gray-100 rounded-md animate-pulse w-16" />
          <div className="h-6 bg-gray-100 rounded-md animate-pulse w-14" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminUnisPage() {
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchRaw, setSearchRaw] = useState("");
  const searchTerm = useDebounce(searchRaw, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<UniDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchUnis = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Universities endpoint is public but we still send credentials
      const res = await api.get("/universities?per_page=200&page=1");
      // Handle both { data: [...] } and { universities: [...] } shapes
      const payload = res.data;
      const list: University[] = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.universities)
        ? payload.universities
        : [];
      setUnis(list);
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = ae.response?.data?.error?.message || "Failed to load universities";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUnis(); }, [fetchUnis]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUni?.name?.trim() || !editingUni?.country?.trim()) {
      toast.error("Name and country are required");
      return;
    }
    setSaving(true);
    const isEditing = !!editingUni.id;
    const payload = {
      name: editingUni.name,
      country: editingUni.country,
      ranking: editingUni.ranking ?? null,
      logo_url: editingUni.logo_url || null,
      description: editingUni.description || null,
      website_url: editingUni.website_url || null,
      is_featured: editingUni.is_featured ?? false,
    };
    try {
      if (isEditing) {
        const res = await api.put(`/universities/${editingUni.id}`, payload);
        const updated: University = res.data.data ?? { ...editingUni, ...payload, id: editingUni.id!, created_at: (editingUni as University).created_at };
        // Bug 2B: update in-place — no full list re-fetch needed
        setUnis((prev) => prev.map((u) => u.id === editingUni.id ? updated : u));
      } else {
        const res = await api.post("/universities", payload);
        const created: University = res.data.data ?? { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() };
        // Bug 2B: prepend to list
        setUnis((prev) => [created, ...prev]);
      }
      toast.success(isEditing ? "University updated" : "University added");
      setIsModalOpen(false);
      setEditingUni(null);
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to save university");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/universities/${deleteTarget}`);
      toast.success("University deleted");
      // Bug 2B: filter out immediately — no full list re-fetch needed
      setUnis((prev) => prev.filter((u) => u.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete university");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUnis = unis.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f5e]">Universities</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage partner universities and institutions.</p>
        </div>
        <Button
          className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white"
          onClick={() => { setEditingUni({ is_featured: false }); setIsModalOpen(true); }}
        >
          <Plus size={16} className="mr-2" /> Add University
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or country…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <p className="text-sm text-gray-500 shrink-0">
          {filteredUnis.length} of <strong>{unis.length}</strong> universities
        </p>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error} —{" "}
          <button onClick={fetchUnis} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">University</th>
                <th className="px-6 py-4 font-semibold">Country</th>
                <th className="px-6 py-4 font-semibold">Ranking</th>
                <th className="px-6 py-4 font-semibold">Featured</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><TableSkeleton /></td></tr>
              ) : filteredUnis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    {error
                      ? "Could not load universities."
                      : searchTerm
                      ? "No universities match your search."
                      : "No universities added yet."}
                  </td>
                </tr>
              ) : (
                filteredUnis.map((uni) => (
                  <tr key={uni.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {uni.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={uni.logo_url}
                            alt={uni.name}
                            className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-white p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#1a2f5e]/10 flex items-center justify-center shrink-0">
                            <Trophy size={16} className="text-[#1a2f5e]/40" />
                          </div>
                        )}
                        <p className="font-semibold text-[#1a2f5e]">{uni.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={13} className="text-gray-400" /> {uni.country}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {uni.ranking ? (
                        <span className="inline-flex items-center gap-1 text-[#c9a84c] font-semibold bg-amber-50 px-2.5 py-1 rounded-full text-xs">
                          <Trophy size={11} /> #{uni.ranking}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {uni.is_featured ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingUni(uni); setIsModalOpen(true); }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#1a2f5e] hover:bg-[#1a2f5e]/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(uni.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
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

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { if (!saving) { setIsModalOpen(o); if (!o) setEditingUni(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a2f5e]">
              {editingUni?.id ? "Edit University" : "Add University"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>University Name *</Label>
              <Input
                value={editingUni?.name || ""}
                onChange={(e) => setEditingUni({ ...editingUni, name: e.target.value })}
                placeholder="e.g. University of Oxford"
                required
              />
            </div>

            {/* Logo — Cloudinary upload (Task 3) */}
            <CloudinaryImageUpload
              label="University Logo"
              value={editingUni?.logo_url || ""}
              onChange={(url) => setEditingUni({ ...editingUni, logo_url: url })}
              folder="mvr/universities"
              aspectRatio="logo"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Country *</Label>
                <Input
                  value={editingUni?.country || ""}
                  onChange={(e) => setEditingUni({ ...editingUni, country: e.target.value })}
                  placeholder="e.g. United Kingdom"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>World Ranking</Label>
                <Input
                  type="number"
                  value={editingUni?.ranking ?? ""}
                  onChange={(e) => setEditingUni({ ...editingUni, ranking: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="e.g. 3"
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input
                value={editingUni?.website_url || ""}
                onChange={(e) => setEditingUni({ ...editingUni, website_url: e.target.value })}
                placeholder="https://www.oxford.ac.uk"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Textarea
                value={editingUni?.description || ""}
                onChange={(e) => setEditingUni({ ...editingUni, description: e.target.value })}
                placeholder="A brief overview of the university…"
                rows={3}
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingUni?.is_featured ?? false}
                onChange={(e) => setEditingUni({ ...editingUni, is_featured: e.target.checked })}
                className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]"
              />
              <span className="text-sm font-medium text-gray-700">Mark as Featured University</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" disabled={saving}>
                {saving ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</> : "Save University"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete University?"
        message="This will permanently remove the university and cannot be undone."
        confirmLabel="Delete University"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
