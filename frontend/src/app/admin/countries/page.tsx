"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Globe, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { CountryEditorForm, type CountryRow } from "@/components/admin/CountryEditorForm";
import { toast } from "sonner";
import api from "@/services/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDebounce } from "@/hooks/useDebounce";

interface Country extends CountryRow {
  created_at: string;
}

type Draft = Partial<Country> | null;

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-56" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/countries?per_page=100&page=1");
      setCountries(res.data.data ?? []);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.name?.trim() || !draft?.slug?.trim() || !draft?.flag?.trim()) {
      toast.error("Name, slug and flag emoji are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: draft.name,
      slug: draft.slug,
      flag: draft.flag,
      tagline: draft.tagline || "",
      image_url: draft.image_url || null,
      hero_image_url: draft.hero_image_url || null,
      sort_order: draft.sort_order ?? 0,
      content: draft.content ?? {},
      ...(draft.id ? { is_active: draft.is_active } : {}),
    };
    try {
      if (draft.id) {
        const res = await api.put(`/admin/countries/${draft.id}`, payload);
        const updated: Country = res.data.data ?? { ...draft, ...payload, id: draft.id, created_at: (draft as Country).created_at };
        // Bug 2B: update in-place — no full list re-fetch needed
        setCountries((prev) => prev.map((c) => c.id === draft.id ? updated : c));
        toast.success("Country updated");
      } else {
        const res = await api.post("/admin/countries", payload);
        const created: Country = res.data.data ?? { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() };
        if (loadFailed || countries.length === 0) {
          await fetchCountries();
        } else {
          setCountries((prev) => [...prev, created]);
        }
        toast.success("Country created");
      }
      setIsModalOpen(false);
      setDraft(null);
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ae.response?.data?.error?.message || "Failed to save country");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (country: Country) => {
    // Bug 2B: optimistic toggle — flip immediately in UI, revert on failure
    setCountries((prev) => prev.map((c) => c.id === country.id ? { ...c, is_active: !c.is_active } : c));
    setToggling(country.id);
    try {
      await api.put(`/admin/countries/${country.id}`, { is_active: !country.is_active });
      toast.success(`${country.name} ${!country.is_active ? "activated" : "deactivated"}`);
    } catch {
      // Revert on failure
      setCountries((prev) => prev.map((c) => c.id === country.id ? { ...c, is_active: country.is_active } : c));
      toast.error("Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/countries/${deleteTarget}`);
      toast.success("Country deleted");
      // Bug 2B: filter out immediately — no full list re-fetch needed
      setCountries((prev) => prev.filter((c) => c.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete country");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Countries"
        description="Manage study-abroad destination pages."
        action={
          <Button
            className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white"
            onClick={() => { setDraft({ is_active: true, sort_order: 0, content: {} }); setIsModalOpen(true); }}
          >
            <Plus size={16} className="mr-2" /> Add Country
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name or slug…" value={searchRaw} onChange={(e) => setSearchRaw(e.target.value)} className="pl-9 h-9" />
        </div>
        <p className="text-sm text-gray-500 shrink-0">{filtered.length} of <strong>{countries.length}</strong></p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Country</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><TableSkeleton /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    {search ? "No countries match your search." : "No countries added yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <p className="font-semibold text-[#1a2f5e]">{c.name}</p>
                          <p className="text-gray-400 text-xs truncate max-w-[200px]">{c.tagline || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{c.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.sort_order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        disabled={toggling === c.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${c.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {toggling === c.id ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : c.is_active ? (
                          <ToggleRight size={12} />
                        ) : (
                          <ToggleLeft size={12} />
                        )}
                        {c.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setDraft(c); setIsModalOpen(true); }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#1a2f5e] hover:bg-[#1a2f5e]/10 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c.id)}
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

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { if (!saving) { setIsModalOpen(o); if (!o) setDraft(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a2f5e]">
              {draft?.id ? "Edit Country" : "Add Country"}
            </DialogTitle>
          </DialogHeader>

          <CountryEditorForm
            draft={draft as CountryRow | null}
            setDraft={setDraft as React.Dispatch<React.SetStateAction<CountryRow | null>>}
            saving={saving}
            onSubmit={handleSave}
            onCancel={() => setIsModalOpen(false)}
            autoSlug={autoSlug}
          />
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Country?"
        message="This will permanently remove the country page. All linked content may break."
        confirmLabel="Delete Country"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
